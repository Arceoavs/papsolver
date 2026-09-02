from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def tier(description: str, cents: int) -> dict:
    return {
        "desc": description,
        "price": {"int": cents, "full": cents / 100},
    }


def test_service_info() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["title"] == "PapSolver"
    assert response.json()["version"] == "2.0.0"


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_exact_solution_minimizes_number_of_purchases() -> None:
    response = client.post(
        "/solve",
        json={"target": 12, "tiers": [tier("three", 3), tier("four", 4)]},
    )

    assert response.status_code == 200
    assert response.json() == {
        "max_object_value": 12,
        "assignment": [
            {"tier": "three", "value": 0},
            {"tier": "four", "value": 3},
        ],
    }


def test_tier_order_deterministically_breaks_ties() -> None:
    response = client.post(
        "/solve",
        json={
            "target": 6,
            "tiers": [tier("four", 4), tier("three", 3), tier("two", 2)],
        },
    )

    assert response.status_code == 200
    assert response.json()["assignment"] == [
        {"tier": "four", "value": 1},
        {"tier": "three", "value": 0},
        {"tier": "two", "value": 1},
    ]


def test_valid_but_infeasible_problem_is_a_conflict() -> None:
    response = client.post(
        "/solve",
        json={"target": 7, "tiers": [tier("four", 4), tier("six", 6)]},
    )

    assert response.status_code == 409
    assert "exactly" in response.json()["detail"]


def test_rejects_duplicate_descriptions() -> None:
    response = client.post(
        "/solve",
        json={"target": 8, "tiers": [tier("same", 2), tier("same", 4)]},
    )

    assert response.status_code == 422
    assert "descriptions must be unique" in response.text


def test_rejects_duplicate_prices() -> None:
    response = client.post(
        "/solve",
        json={"target": 8, "tiers": [tier("one", 4), tier("two", 4)]},
    )

    assert response.status_code == 422
    assert "prices must be unique" in response.text


def test_rejects_non_integer_target() -> None:
    response = client.post(
        "/solve",
        json={"target": 8.5, "tiers": [tier("four", 4)]},
    )

    assert response.status_code == 422


def test_rejects_non_positive_price() -> None:
    response = client.post(
        "/solve",
        json={"target": 8, "tiers": [tier("free", 0)]},
    )

    assert response.status_code == 422


def test_rejects_target_above_safety_cap() -> None:
    response = client.post(
        "/solve",
        json={"target": 100_001, "tiers": [tier("one", 1)]},
    )

    assert response.status_code == 422


def test_rejects_mismatched_full_price() -> None:
    problem_tier = tier("wrong", 99)
    problem_tier["price"]["full"] = 1.99

    response = client.post("/solve", json={"target": 99, "tiers": [problem_tier]})

    assert response.status_code == 422
    assert "price.full" in response.text


def test_accepts_a_price_above_the_target() -> None:
    response = client.post(
        "/solve",
        json={"target": 5, "tiers": [tier("five", 5), tier("expensive", 119_999)]},
    )

    assert response.status_code == 200
    assert response.json()["assignment"] == [
        {"tier": "five", "value": 1},
        {"tier": "expensive", "value": 0},
    ]


def test_accepts_the_full_pricing_catalogue() -> None:
    tiers = [tier(f"tier-{price}", price) for price in range(1, 801)]

    response = client.post("/solve", json={"target": 1, "tiers": tiers})

    assert response.status_code == 200
    assert len(response.json()["assignment"]) == 800
    assert response.json()["assignment"][0] == {"tier": "tier-1", "value": 1}
