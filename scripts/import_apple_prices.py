#!/usr/bin/env python3
"""Normalize an App Store Connect price-point export into the app snapshot.

This command is deliberately offline: obtain JSON with the authenticated App
Store Connect API, or export CSV from App Store Connect, then pass that local
file here. It never accepts, stores, or transmits API credentials.

The importer understands App Store Connect API resources with an
``attributes.customerPrice`` value and common human-readable export headings
such as ``Customer Price``, ``Price Point ID``, ``Territory``, and ``Currency``.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections.abc import Iterable, Iterator, Mapping, Sequence
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

CANONICAL_SOURCE_URL = "https://developer.apple.com/documentation/appstoreconnectapi"
PRICE_KEYS = (
    "pricecents",
    "customerprice",
    "retailprice",
    "displayprice",
    "price",
)
ID_KEYS = ("pricepointid", "priceid", "identifier", "id")
CURRENCY_KEYS = ("currencycode", "currency")
TERRITORY_KEYS = (
    "territorycode",
    "storefrontcode",
    "storefront",
    "countrycode",
    "territory",
    "country",
)


class ImportErrorWithContext(ValueError):
    """An invalid or unsupported source record."""


def normalized_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.casefold())


def normalized_token(value: object) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(value).upper())


def flattened_values(
    value: Mapping[str, Any], prefix: tuple[str, ...] = ()
) -> Iterator[tuple[tuple[str, ...], str, Any]]:
    for raw_key, child in value.items():
        key = normalized_key(str(raw_key))
        path = (*prefix, key)
        if isinstance(child, Mapping):
            yield from flattened_values(child, path)
        elif child is not None and child != "":
            yield path, key, child


def choose_value(
    values: Sequence[tuple[tuple[str, ...], str, Any]], aliases: Sequence[str]
) -> Any | None:
    for alias in aliases:
        for _path, key, value in values:
            if key == alias:
                return value
    return None


def choose_price(values: Sequence[tuple[tuple[str, ...], str, Any]]) -> tuple[Any, bool] | None:
    for alias in PRICE_KEYS:
        for _path, key, value in values:
            # Currency-qualified CSV headings such as "Customer Price (EUR)"
            # normalize to customerpriceeur.
            if key == alias or (alias == "customerprice" and key.startswith(alias)):
                return value, alias == "pricecents"
    return None


def choose_record_id(values: Sequence[tuple[tuple[str, ...], str, Any]]) -> str | None:
    # The API resource ID is at the record root. Do not mistake a related
    # territory's ID for a price-point ID.
    for path, key, value in values:
        if key == "id" and len(path) == 1:
            return str(value)
    value = choose_value(values, ID_KEYS[:-1])
    return str(value) if value is not None else None


def choose_territory(values: Sequence[tuple[tuple[str, ...], str, Any]]) -> Any | None:
    value = choose_value(values, TERRITORY_KEYS)
    if value is not None:
        return value
    for path, key, value in values:
        if key == "id" and "territory" in path:
            return value
    return None


def decimal_from_money(value: Any) -> Decimal:
    if isinstance(value, bool):
        raise ImportErrorWithContext("boolean is not a monetary value")
    text = str(value) if isinstance(value, (int, float, Decimal)) else str(value).strip()

    if not text:
        raise ImportErrorWithContext("empty monetary value")
    if text.startswith("(") and text.endswith(")"):
        raise ImportErrorWithContext(f"negative monetary value: {value!r}")

    text = text.replace("\u00a0", "").replace("\u202f", "").replace(" ", "")
    text = re.sub(r"[^0-9,.'+-]", "", text).replace("'", "")

    if "," in text and "." in text:
        decimal_mark = "," if text.rfind(",") > text.rfind(".") else "."
        grouping_mark = "." if decimal_mark == "," else ","
        text = text.replace(grouping_mark, "").replace(decimal_mark, ".")
    elif "," in text:
        suffix = text.rsplit(",", 1)[1]
        text = text.replace(",", "." if len(suffix) in (1, 2) else "")
    elif text.count(".") > 1:
        suffix = text.rsplit(".", 1)[1]
        text = text.replace(".", "") if len(suffix) == 3 else text

    try:
        amount = Decimal(text)
    except InvalidOperation as error:
        raise ImportErrorWithContext(f"invalid monetary value: {value!r}") from error
    if amount <= 0:
        raise ImportErrorWithContext(f"price must be positive: {value!r}")
    return amount


def money_to_cents(value: Any, already_cents: bool) -> int:
    amount = decimal_from_money(value)
    cents = amount if already_cents else amount * 100
    integral = cents.to_integral_value()
    if cents != integral:
        raise ImportErrorWithContext(f"price has a fraction of a cent: {value!r}")
    return int(integral)


def iter_json_records(payload: Any) -> Iterator[Mapping[str, Any]]:
    if isinstance(payload, list):
        for item in payload:
            if isinstance(item, Mapping) and isinstance(item.get("data"), (list, dict)):
                yield from iter_json_records(item)
            elif isinstance(item, Mapping):
                yield item
        return
    if not isinstance(payload, Mapping):
        raise ImportErrorWithContext("JSON root must be an object or array")

    for collection_key in ("data", "results", "pricePoints", "prices"):
        collection = payload.get(collection_key)
        if isinstance(collection, list):
            for item in collection:
                if isinstance(item, Mapping):
                    yield item
            return
        if isinstance(collection, Mapping):
            yield collection
            return

    yield payload


def load_json(path: Path) -> list[Mapping[str, Any]]:
    with path.open(encoding="utf-8") as source:
        return list(iter_json_records(json.load(source)))


def load_csv(path: Path) -> list[Mapping[str, Any]]:
    with path.open(encoding="utf-8-sig", newline="") as source:
        sample = source.read(8192)
        source.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        reader = csv.DictReader(source, dialect=dialect)
        if not reader.fieldnames:
            raise ImportErrorWithContext("CSV file has no header row")
        return [dict(row) for row in reader]


def load_records(path: Path, source_format: str) -> list[Mapping[str, Any]]:
    selected_format = source_format
    if selected_format == "auto":
        selected_format = "json" if path.suffix.casefold() == ".json" else "csv"
    return load_json(path) if selected_format == "json" else load_csv(path)


def normalize_records(
    records: Iterable[Mapping[str, Any]],
    territory: str,
    territory_aliases: set[str],
    currency: str,
) -> list[dict[str, object]]:
    accepted_territories = {
        normalized_token(territory),
        *(normalized_token(alias) for alias in territory_aliases),
    }
    expected_currency = normalized_token(currency)
    selected: list[tuple[int, int, str | None]] = []

    for source_index, record in enumerate(records):
        values = list(flattened_values(record))
        price = choose_price(values)
        if price is None:
            continue

        row_currency = choose_value(values, CURRENCY_KEYS)
        if row_currency is not None and normalized_token(row_currency) != expected_currency:
            continue
        row_territory = choose_territory(values)
        if (
            row_territory is not None
            and normalized_token(row_territory) not in accepted_territories
        ):
            continue

        selected.append(
            (
                money_to_cents(price[0], already_cents=price[1]),
                source_index,
                choose_record_id(values),
            )
        )

    if not selected:
        raise ImportErrorWithContext(
            "no matching customer prices found; check the format, territory aliases, and currency"
        )

    selected.sort(key=lambda row: (row[0], row[1]))
    output: list[dict[str, object]] = []
    seen_ids: set[str] = set()
    fallback_prefix = normalized_token(territory).lower()
    for position, (price_cents, _source_index, record_id) in enumerate(selected):
        identifier = record_id or f"{fallback_prefix}-{position:04d}"
        if identifier in seen_ids:
            raise ImportErrorWithContext(f"duplicate price-point ID: {identifier!r}")
        seen_ids.add(identifier)
        output.append({"id": identifier, "priceCents": price_cents})
    return output


def valid_date(value: str) -> str:
    try:
        date.fromisoformat(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("expected an ISO date (YYYY-MM-DD)") from error
    return value


def valid_sha256(value: str) -> str:
    if not re.fullmatch(r"[0-9a-fA-F]{64}", value):
        raise argparse.ArgumentTypeError("expected a 64-character hexadecimal SHA-256")
    return value.lower()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="local App Store Connect JSON/CSV")
    parser.add_argument("output", type=Path, help="snapshot path, or '-' for stdout")
    parser.add_argument("--format", choices=("auto", "json", "csv"), default="auto")
    parser.add_argument("--territory", required=True, help="App Store territory ID, e.g. DEU")
    parser.add_argument(
        "--territory-alias",
        action="append",
        default=[],
        help="additional accepted row value, e.g. DE or Germany (repeatable)",
    )
    parser.add_argument("--country", required=True, help="human-readable country name")
    parser.add_argument("--country-code", required=True, help="ISO country code, e.g. DE")
    parser.add_argument("--currency", required=True, help="ISO 4217 code, e.g. EUR")
    parser.add_argument("--as-of", required=True, type=valid_date, help="export date")
    parser.add_argument(
        "--retrieved-at",
        type=valid_date,
        help="optional date on which the source artifact was retrieved",
    )
    parser.add_argument("--source-name", default="App Store Connect export")
    parser.add_argument("--source-url", default=CANONICAL_SOURCE_URL)
    parser.add_argument(
        "--source-authority",
        default="Apple (first-party authenticated export)",
        help="human-readable provenance classification",
    )
    parser.add_argument(
        "--source-claim",
        help="optional description of what the source publisher says about the data",
    )
    parser.add_argument(
        "--source-content-sha256",
        type=valid_sha256,
        help="optional SHA-256 of the unmodified source artifact",
    )
    parser.add_argument(
        "--caveat",
        default=(
            "Availability is scoped to the App Store Connect account and product "
            "identifier used for the export; rerun against Apple for current values."
        ),
        help="qualification to store alongside the snapshot",
    )
    parser.add_argument(
        "--tax-inclusive",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="whether customer prices include applicable tax (default: true)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        records = load_records(args.input, args.format)
        prices = normalize_records(
            records,
            territory=args.territory,
            territory_aliases={args.country, args.country_code, *args.territory_alias},
            currency=args.currency,
        )
    except (OSError, json.JSONDecodeError, csv.Error, ImportErrorWithContext) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    snapshot = {
        "schemaVersion": 1,
        "metadata": {
            "country": args.country,
            "countryCode": args.country_code.upper(),
            "appStoreConnectTerritory": args.territory.upper(),
            "currency": args.currency.upper(),
            "taxInclusive": args.tax_inclusive,
            "asOf": args.as_of,
            **({"retrievedAt": args.retrieved_at} if args.retrieved_at else {}),
            "sourceName": args.source_name,
            "sourceUrl": args.source_url,
            "sourceAuthority": args.source_authority,
            **({"sourceClaim": args.source_claim} if args.source_claim else {}),
            **(
                {"sourceContentSha256": args.source_content_sha256}
                if args.source_content_sha256
                else {}
            ),
            "canonicalSource": "Apple App Store Connect API",
            "canonicalSourceUrl": CANONICAL_SOURCE_URL,
            "caveat": args.caveat,
            "recordCount": len(prices),
            "generatedBy": "scripts/import_apple_prices.py",
        },
        "prices": prices,
    }
    rendered = json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"
    if str(args.output) == "-":
        sys.stdout.write(rendered)
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        temporary = args.output.with_suffix(args.output.suffix + ".tmp")
        temporary.write_text(rendered, encoding="utf-8")
        temporary.replace(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
