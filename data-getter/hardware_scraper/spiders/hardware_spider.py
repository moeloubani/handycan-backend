import scrapy
import json
from datetime import datetime
from urllib.parse import urljoin, urlparse
from hardware_scraper.items import ProductItem
from hardware_scraper.utils import (
    parse_sitemap, get_sitemap_index, filter_product_urls,
    extract_text_content, extract_price, clean_specifications,
    is_manual_link, normalize_url
)
from config import SITES_CONFIG, TARGET_CATEGORIES

class HardwareSpider(scrapy.Spider):
    name = 'hardware'
    
    def __init__(self, site='rona', *args, **kwargs):
        super(HardwareSpider, self).__init__(*args, **kwargs)
        
        if site not in SITES_CONFIG:
            raise ValueError(f"Site '{site}' not configured. Available: {list(SITES_CONFIG.keys())}")
        
        self.site_config = SITES_CONFIG[site]
        self.site_name = site
        self.allowed_domains = self.site_config['allowed_domains']
        self.start_urls = [self.site_config['sitemap_url']]
        
        # Update spider settings
        self.custom_settings = {
            'USER_AGENT': self.site_config['user_agent'],
            'DOWNLOAD_DELAY': self.site_config['download_delay'],
            'CONCURRENT_REQUESTS': self.site_config['concurrent_requests'],
        }
        
        self.logger.info(f"Initialized spider for {self.site_config['name']}")

    def parse(self, response):
        """Parse main sitemap to find product sitemaps"""
        self.logger.info(f"Parsing sitemap index: {response.url}")
        
        # Get all sitemap URLs from the index
        sitemap_urls = get_sitemap_index(response.url)
        
        if not sitemap_urls:
            # If no sitemaps found, try parsing as direct sitemap
            product_urls = parse_sitemap(response.url)
            filtered_urls = filter_product_urls(product_urls, TARGET_CATEGORIES)
            
            for url in filtered_urls[:100]:  # Limit for testing
                yield scrapy.Request(
                    url=url,
                    callback=self.parse_product,
                    meta={'site': self.site_name}
                )
        else:
            # Process individual sitemaps
            for sitemap_url in sitemap_urls:
                if any(keyword in sitemap_url.lower() for keyword in ['product', 'category']):
                    yield scrapy.Request(
                        url=sitemap_url,
                        callback=self.parse_sitemap,
                        meta={'site': self.site_name}
                    )

    def parse_sitemap(self, response):
        """Parse individual sitemap files"""
        self.logger.info(f"Parsing sitemap: {response.url}")
        
        product_urls = parse_sitemap(response.url)
        filtered_urls = filter_product_urls(product_urls, TARGET_CATEGORIES)
        
        self.logger.info(f"Found {len(filtered_urls)} product URLs in {response.url}")
        
        for url in filtered_urls[:50]:  # Limit for testing
            yield scrapy.Request(
                url=url,
                callback=self.parse_product,
                meta={'site': self.site_name}
            )

    def parse_product(self, response):
        """Parse individual product pages"""
        self.logger.info(f"Parsing product: {response.url}")
        
        item = ProductItem()
        
        # Basic product information
        item['url'] = response.url
        item['site'] = response.meta['site']
        item['scraped_at'] = datetime.now().isoformat()
        
        # Extract product data based on site
        if self.site_name == 'rona':
            self.extract_rona_data(response, item)
        elif self.site_name == 'canadiantire':
            self.extract_canadiantire_data(response, item)
        
        yield item

    def extract_rona_data(self, response, item):
        """Extract product data specific to Rona website"""
        # Product name
        item['name'] = extract_text_content(
            response.css('h1.pdp-product-name::text, .product-title h1::text')
        )
        
        # Brand
        item['brand'] = extract_text_content(
            response.css('.brand-name::text, .product-brand::text')
        )
        
        # Model/SKU
        item['model'] = extract_text_content(
            response.css('.model-number::text, .sku::text')
        )
        item['sku'] = extract_text_content(
            response.css('.sku-number::text, [data-sku]::attr(data-sku)')
        )
        
        # Price
        price_text = extract_text_content(
            response.css('.price::text, .current-price::text, .product-price::text')
        )
        item['price'] = extract_price(price_text)
        
        # Description
        item['description'] = extract_text_content(
            response.css('.product-description p::text, .description::text')
        )
        
        # Category
        breadcrumbs = response.css('.breadcrumb a::text').getall()
        if breadcrumbs:
            item['category'] = breadcrumbs[-2] if len(breadcrumbs) > 1 else breadcrumbs[0]
            item['subcategory'] = breadcrumbs[-1] if len(breadcrumbs) > 1 else None
        
        # Images
        images = response.css('.product-image img::attr(src), .gallery img::attr(src)').getall()
        item['images'] = [normalize_url(img, response.url) for img in images if img]
        
        # Specifications
        specs = {}
        for spec in response.css('.specifications tr, .product-specs tr'):
            key = extract_text_content(spec.css('td:first-child::text, th::text'))
            value = extract_text_content(spec.css('td:last-child::text'))
            if key and value:
                specs[key] = value
        item['specifications'] = clean_specifications(specs)
        
        # Features
        features = response.css('.features li::text, .product-features li::text').getall()
        item['features'] = [f.strip() for f in features if f.strip()]
        
        # Manuals and documents
        manuals = []
        documents = []
        
        for link in response.css('a'):
            href = link.css('::attr(href)').get()
            text = extract_text_content(link.css('::text'))
            
            if href and is_manual_link(href, text):
                full_url = normalize_url(href, response.url)
                if href.lower().endswith('.pdf'):
                    manuals.append({
                        'url': full_url,
                        'title': text or 'Manual',
                        'type': 'pdf'
                    })
                else:
                    documents.append({
                        'url': full_url,
                        'title': text or 'Document'
                    })
        
        item['manuals'] = manuals
        item['documents'] = documents
        
        # Additional fields
        item['availability'] = extract_text_content(
            response.css('.availability::text, .stock-status::text')
        )
        
        # Rating
        rating_text = extract_text_content(
            response.css('.rating::text, .star-rating::attr(data-rating)')
        )
        if rating_text:
            try:
                item['rating'] = float(rating_text)
            except ValueError:
                item['rating'] = None
        
        # Dimensions and weight
        item['dimensions'] = extract_text_content(
            response.css('.dimensions::text, [data-dimension]::text')
        )
        item['weight'] = extract_text_content(
            response.css('.weight::text, [data-weight]::text')
        )
        
        # Warranty
        item['warranty'] = extract_text_content(
            response.css('.warranty::text, .warranty-info::text')
        )

    def extract_canadiantire_data(self, response, item):
        """Extract product data specific to Canadian Tire website"""
        # Similar structure to Rona but with different selectors
        item['name'] = extract_text_content(
            response.css('h1.pdp-product-name::text, .product-name h1::text')
        )
        
        item['brand'] = extract_text_content(
            response.css('.brand::text, .manufacturer::text')
        )
        
        item['model'] = extract_text_content(
            response.css('.model::text, .item-number::text')
        )
        
        price_text = extract_text_content(
            response.css('.price-current::text, .price::text')
        )
        item['price'] = extract_price(price_text)
        
        item['description'] = extract_text_content(
            response.css('.product-description::text, .description p::text')
        )
        
        # Continue with similar patterns as Rona extraction...