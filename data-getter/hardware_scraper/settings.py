BOT_NAME = 'hardware_scraper'

SPIDER_MODULES = ['hardware_scraper.spiders']
NEWSPIDER_MODULE = 'hardware_scraper.spiders'

ROBOTSTXT_OBEY = True

DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

ITEM_PIPELINES = {
    'hardware_scraper.pipelines.ValidationPipeline': 200,
    'hardware_scraper.pipelines.DuplicatesPipeline': 300,
    'hardware_scraper.pipelines.ManualDownloadPipeline': 400,
    'hardware_scraper.pipelines.JsonWriterPipeline': 500,
}

DOWNLOAD_DELAY = 2
RANDOMIZE_DOWNLOAD_DELAY = 0.5
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 4

AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
AUTOTHROTTLE_DEBUG = False

HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600

REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'

FEEDS = {
    'data/products_%(name)s_%(time)s.json': {
        'format': 'json',
        'encoding': 'utf8',
        'store_empty': False,
        'indent': 2,
    },
    'data/products_%(name)s_%(time)s.csv': {
        'format': 'csv',
        'encoding': 'utf8',
        'store_empty': False,
    }
}