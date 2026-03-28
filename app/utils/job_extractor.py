def extract_job_details(url: str):
    import requests
    from bs4 import BeautifulSoup
    from datetime import date
    from urllib.parse import urlparse

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    title_tag = soup.find("title")
    full_title = title_tag.text.strip() if title_tag else None

    job_title = None
    company_name = "Unknown"

    parsed = urlparse(url)
    job_portal = parsed.netloc.lower()

    if full_title:

        # -------------------------
        # DICE LOGIC
        # -------------------------
        if "dice.com" in job_portal:
            parts = [p.strip() for p in full_title.split("-")]
            if len(parts) >= 2:
                job_title = parts[0]
                company_name = parts[1]

        # -------------------------
        # LINKEDIN LOGIC
        # -------------------------
        elif "linkedin.com" in job_portal:
            clean_title = full_title.replace("| LinkedIn", "").strip()

            if "hiring" in clean_title.lower():
                parts = clean_title.split("hiring")
                company_name = parts[0].strip()
                job_title = parts[1].strip()
            else:
                job_title = clean_title

        # -------------------------
        # MONSTER LOGIC
        # -------------------------
        elif "monster.com" in job_portal:
            clean_title = full_title.replace("| Monster.com", "").strip()
            job_title = clean_title

        # -------------------------
        # DEFAULT FALLBACK
        # -------------------------
        else:
            job_title = full_title

    return {
        "job_title": job_title,
        "company_name": company_name,
        "job_portal": job_portal,
        "applied_date": date.today()
    }