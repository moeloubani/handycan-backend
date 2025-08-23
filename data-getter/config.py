import os
from dotenv import load_dotenv

load_dotenv()

SITES_CONFIG = {
    'canadiantire': {
        'name': 'Canadian Tire',
        'base_url': 'https://www.canadiantire.ca',
        'sitemap_url': 'https://www.canadiantire.ca/sitemap.xml',
        'allowed_domains': ['canadiantire.ca'],
        'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'download_delay': 2,
        'concurrent_requests': 8,
    },
    'rona': {
        'name': 'Rona',
        'base_url': 'https://www.rona.ca',
        'sitemap_url': 'https://www.rona.ca/sitemap.xml',
        'allowed_domains': ['rona.ca'],
        'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'download_delay': 2,
        'concurrent_requests': 8,
    }
}

DEFAULT_SETTINGS = {
    'ROBOTSTXT_OBEY': True,
    'DOWNLOAD_DELAY': 2,
    'RANDOMIZE_DOWNLOAD_DELAY': 0.5,
    'CONCURRENT_REQUESTS': 8,
    'CONCURRENT_REQUESTS_PER_DOMAIN': 4,
    'AUTOTHROTTLE_ENABLED': True,
    'AUTOTHROTTLE_START_DELAY': 1,
    'AUTOTHROTTLE_MAX_DELAY': 60,
    'AUTOTHROTTLE_TARGET_CONCURRENCY': 2.0,
    'AUTOTHROTTLE_DEBUG': False,
    'HTTPCACHE_ENABLED': True,
    'HTTPCACHE_EXPIRATION_SECS': 3600,
    'REQUEST_FINGERPRINTER_IMPLEMENTATION': '2.7',
}

OUTPUT_DIR = os.getenv('OUTPUT_DIR', './data')
LOGS_DIR = os.getenv('LOGS_DIR', './logs')
MANUALS_DIR = os.getenv('MANUALS_DIR', './manuals')

TARGET_CATEGORIES = [
    'tools',
    'appliances', 
    'hardware',
    'power-tools',
    'hand-tools',
    'outdoor',
    'automotive',
    'lawn-garden',
    'home-improvement'
]