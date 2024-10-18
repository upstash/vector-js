import os
import requests
from datetime import datetime, timedelta
import json
import subprocess
import re

PACKAGE_NAME = "@upstash/vector"
DAYS_TO_KEEP = 9
CI_VERSIONS_TO_KEEP = 5
NPM_TOKEN = os.environ.get("NPM_TOKEN")


def run_npm_command(command):
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(e.stderr)
        return None


def get_package_versions():
    output = run_npm_command(["npm", "view", PACKAGE_NAME, "versions", "--json"])
    if output:
        return json.loads(output)
    return []


def get_version_details(version):
    output = run_npm_command(["npm", "view", f"{PACKAGE_NAME}@{version}", "--json"])
    if output:
        return json.loads(output)
    return {}


def parse_ci_version_date(version):
    match = re.search(r"-(\d{14})$", version)
    if match:
        date_str = match.group(1)
        return datetime.strptime(date_str, "%Y%m%d%H%M%S")
    return None


def is_ci_version(version):
    return bool(re.search(r"-ci\.", version))


def deprecate_package_version(version):
    result = run_npm_command(
        [
            "npm",
            "deprecate",
            f"{PACKAGE_NAME}@{version}",
            "This CI version has been deprecated due to retention policy",
        ]
    )
    if result is not None:
        print(f"Successfully deprecated version: {version}")
        return True
    else:
        print(f"Failed to deprecate version: {version}")
        return False


def apply_retention_policy():
    versions = get_package_versions()

    now = datetime.utcnow()
    retention_date = now - timedelta(days=DAYS_TO_KEEP)

    ci_versions = []

    for version in versions:
        if is_ci_version(version):
            ci_date = parse_ci_version_date(version)
            if ci_date:
                version_details = get_version_details(version)
                if version_details.get("deprecated"):
                    print(f"Skipping deprecated version: {version}")
                    continue
                ci_versions.append((version, ci_date))
            else:
                print(f"Warning: Could not parse date from CI version: {version}")

    ci_versions.sort(key=lambda x: x[1], reverse=True)

    versions_to_keep = []
    versions_to_deprecate = []

    for version, date in ci_versions:
        if len(versions_to_keep) < CI_VERSIONS_TO_KEEP or date > retention_date:
            versions_to_keep.append(version)
        else:
            versions_to_deprecate.append(version)
            print(f"Deprecating version: {version}")

    for version in versions_to_deprecate:
        version_deprecated = deprecate_package_version(version)
        if not version_deprecated:
            print(f"Failed to delete or deprecate version: {version}")

    print(f"Keeping {len(versions_to_keep)} CI versions:")
    for version in versions_to_keep:
        print(f"  {version}")


if __name__ == "__main__":
    apply_retention_policy()
