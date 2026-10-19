#!/usr/bin/env python3
"""
GSC Harvester - Daily Search Opportunity Finder for morsewatcher.com
Identifies "low-hanging fruit" keywords: queries where the domain receives
impressions but zero or few clicks, signaling opportunities for targeted guides.
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Any


def fetch_search_performance(
    credentials_path: str,
    site_url: str = "sc-domain:morsewatcher.com",
    days: int = 14
) -> List[Dict[str, Any]]:
    """
    Connects to the Google Search Console API and fetches search performance
    queries aggregated over the specified lookback window.
    """
    if not os.path.exists(credentials_path):
        raise FileNotFoundError(
            f"Credentials file not found at: {credentials_path}\n"
            "Please provide a valid Google Cloud Service Account key JSON file."
        )

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        raise ImportError(
            "Missing required Google client libraries. Run:\n"
            "  pip3 install -r scripts/requirements.txt"
        )

    scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path, scopes=scopes
    )
    service = build("searchconsole", "v1", credentials=credentials)

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)

    request_body = {
        "startDate": start_date.strftime("%Y-%m-%d"),
        "endDate": end_date.strftime("%Y-%m-%d"),
        "dimensions": ["query"],
        "rowLimit": 500,
        "aggregationType": "auto"
    }

    response = service.searchanalytics().query(
        siteUrl=site_url, body=request_body
    ).execute()

    raw_rows = response.get("rows", [])
    results = []
    for r in raw_rows:
        query = r.get("keys", [""])[0]
        results.append({
            "query": query,
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "ctr": round(r.get("ctr", 0.0) * 100, 2),
            "position": round(r.get("position", 0.0), 1),
        })

    return results


def filter_opportunity_keywords(
    rows: List[Dict[str, Any]],
    min_impressions: int = 10,
    max_clicks: int = 3,
    min_position: float = 8.0
) -> List[Dict[str, Any]]:
    """
    Filters search queries using Rasty's Low-Hanging Fruit criteria:
    - High or growing impressions (Google considers the domain relevant)
    - Low clicks (users aren't clicking because there is no direct landing page)
    - Position >= min_position (not already ranking top 3 on page 1)
    """
    opportunities = []
    for item in rows:
        if (
            item["impressions"] >= min_impressions
            and item["clicks"] <= max_clicks
            and item["position"] >= min_position
        ):
            opportunities.append(item)

    # Sort opportunities descending by impression volume
    opportunities.sort(key=lambda x: x["impressions"], reverse=True)
    return opportunities


def generate_opportunity_report(opportunities: List[Dict[str, Any]]) -> str:
    """
    Generates a human-readable Markdown table of opportunities
    with automated suggested content angles.
    """
    if not opportunities:
        return (
            "### No Low-Hanging Fruit Found Yet\n"
            "Either impression volume is still accumulating or all current queries "
            "are already capturing clicks. Check back after a few days of crawling."
        )

    lines = [
        "## GSC Harvester: Recommended Content Opportunities\n",
        "| Priority | Query | Impressions | Clicks | Avg Position | Suggested Content Angle |",
        "| :---: | :--- | :---: | :---: | :---: | :--- |"
    ]

    for idx, opp in enumerate(opportunities, 1):
        q = opp["query"]
        imp = opp["impressions"]
        clk = opp["clicks"]
        pos = opp["position"]

        # Suggest clean title / topic angle based on query keywords
        if "sos" in q.lower():
            angle = f"Emergency / SOS Guide: '{q.title()}'"
        elif "camera" in q.lower() or "iphone" in q.lower() or "app" in q.lower():
            angle = f"App Feature Walkthrough: '{q.title()}'"
        elif "flashlight" in q.lower() or "torch" in q.lower() or "light" in q.lower():
            angle = f"Optical Field Tutorial: '{q.title()}'"
        else:
            angle = f"Targeted Explainer: '{q.title()}'"

        lines.append(f"| #{idx} | **{q}** | {imp} | {clk} | {pos} | {angle} |")

    lines.append("\n> **Next Step:** Select the top query above and ask Antigravity to write a dedicated guide for it.")
    return "\n".join(lines)


def main() -> None:
    """CLI entry point for running the daily harvester."""
    parser = argparse.ArgumentParser(
        description="Daily Search Console Opportunity Harvester for morsewatcher.com"
    )
    parser.add_argument(
        "--credentials",
        "-c",
        default="scripts/service-account.json",
        help="Path to Google Service Account JSON file (default: scripts/service-account.json)"
    )
    parser.add_argument(
        "--property",
        "-p",
        default="sc-domain:morsewatcher.com",
        help="Search Console property (default: sc-domain:morsewatcher.com)"
    )
    parser.add_argument(
        "--days",
        "-d",
        type=int,
        default=14,
        help="Lookback period in days (default: 14)"
    )
    parser.add_argument(
        "--min-imp",
        type=int,
        default=5,
        help="Minimum impressions threshold (default: 5)"
    )

    args = parser.parse_args()

    print(f"=== GSC Harvester for {args.property} ===")
    print(f"Lookback: {args.days} days | Min impressions: {args.min_imp}\n")

    if not os.path.exists(args.credentials):
        print(f"Notice: Credentials file '{args.credentials}' not found.")
        print("\nHow to set up credentials:")
        print("1. Go to Google Cloud Console (https://console.cloud.google.com)")
        print("2. Enable the 'Google Search Console API'")
        print("3. Create a Service Account, generate a JSON key, and save it as 'scripts/service-account.json'")
        print("4. Add the service account email as a user with Read permissions in Google Search Console Settings -> Users")
        print("\nSample Demo Run with simulated queries:\n")

        sample_data = [
            {"query": "decode morse code light iphone", "impressions": 142, "clicks": 2, "ctr": 1.4, "position": 28.4},
            {"query": "flashlight morse code translator app", "impressions": 98, "clicks": 1, "ctr": 1.0, "position": 34.2},
            {"query": "how to read morse code flashing light", "impressions": 85, "clicks": 0, "ctr": 0.0, "position": 41.0},
            {"query": "morse code camera detector", "impressions": 64, "clicks": 3, "ctr": 4.6, "position": 19.5},
            {"query": "sos flashlight signal speed", "impressions": 38, "clicks": 0, "ctr": 0.0, "position": 22.1},
        ]
        opportunities = filter_opportunity_keywords(sample_data, min_impressions=args.min_imp)
        report = generate_opportunity_report(opportunities)
        print(report)
        return

    try:
        rows = fetch_search_performance(args.credentials, args.property, days=args.days)
        print(f"Retrieved {len(rows)} query performance records.")
        opportunities = filter_opportunity_keywords(rows, min_impressions=args.min_imp)
        print(f"Found {len(opportunities)} low-hanging fruit keyword opportunities.\n")
        report = generate_opportunity_report(opportunities)
        print(report)
    except Exception as e:
        print(f"Error fetching data from Google Search Console: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
