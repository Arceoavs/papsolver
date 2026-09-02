# Pricing snapshots

`de-prices.json` is neutral application data. Every entry has a snapshot-local
string `id` and an integer `priceCents`. A small set of highlighted entries
also has an optional string `description`. These descriptions are
project-maintained paraphrases of entries highlighted in the `Common use`
column of [Galva's Germany pricing summary](https://galva.io/tools/apple-pricing-tiers/region/de),
not quotations. Absence of a description means only that the source did not
highlight that entry; it does not affect whether the price is available. This
is not a legacy Apple “tier” list.

IDs from official API JSON are preserved. When an input has no price-point ID,
the importer generates deterministic, snapshot-local IDs after sorting by
customer price; consumers must not treat those generated IDs as Apple IDs.

The checked-in Germany snapshot comes from the source and verification date
recorded in that file. It is a third-party reproduction of an App Store
Connect matrix, not a live Apple response. Current canonical prices are
available only through an authenticated App Store Connect account in the
context of an app, subscription, or in-app purchase.

To replace it with an official export, download the relevant price-point data
from App Store Connect as JSON or CSV and run, for example:

```sh
uv run python scripts/import_apple_prices.py export.json \
  papsolvue/app/data/de-prices.json \
  --territory DEU --territory-alias DE --territory-alias Germany \
  --country Germany --country-code DE --currency EUR \
  --as-of 2026-09-02
```

The importer uses only the Python standard library and is intentionally
offline. It does not accept or store App Store Connect keys or JWTs. Review
the output diff, especially its metadata and row count, before committing it.
The importer produces the complete price-point list but does not recreate the
third-party summary annotations or their project-authored paraphrases;
preserve or re-verify those separately against the attributed Galva source
when refreshing this checked-in snapshot.
