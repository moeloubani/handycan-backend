# Hardware Store Web Scraper

A comprehensive web scraping solution for extracting product data and instruction manuals from hardware store websites like Canadian Tire and Rona.

## Features

- **Sitemap-driven discovery**: Efficiently discovers products through XML sitemaps
- **Structured data extraction**: Extracts detailed product information including specifications, images, and pricing
- **Manual downloading**: Automatically downloads instruction manuals and technical documents
- **Multiple output formats**: Saves data in JSON and CSV formats
- **Respectful scraping**: Implements rate limiting, robots.txt compliance, and auto-throttling
- **Multi-site support**: Configurable for different hardware store websites
- **Robust error handling**: Continues operation despite individual page failures

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment file:
```bash
cp .env.example .env
```

## Usage

### Basic Usage

Scrape Rona website:
```bash
python run_scraper.py rona
```

Scrape Canadian Tire website:
```bash
python run_scraper.py canadiantire
```

### Advanced Options

Limit items for testing:
```bash
python run_scraper.py rona --limit 100
```

Custom output directory:
```bash
python run_scraper.py rona --output-dir ./my_data
```

Dry run (show command without executing):
```bash
python run_scraper.py rona --dry-run
```

List available sites:
```bash
python run_scraper.py --list-sites
```

### Direct Scrapy Usage

You can also run Scrapy directly for more control:

```bash
# Basic scraping
scrapy crawl hardware -a site=rona

# With custom settings
scrapy crawl hardware -a site=rona -s CLOSESPIDER_ITEMCOUNT=50 -L INFO

# Save to specific file
scrapy crawl hardware -a site=rona -O products.json
```

## Output Structure

### Data Files

The scraper generates several output files:

- `data/products_{site}_{timestamp}.json` - Complete product data in JSON format
- `data/products_{site}_{timestamp}.csv` - Flattened data for analysis
- `data/products_{site}_{timestamp}_metadata.json` - Scraping statistics and metadata

### Manual Files

Downloaded manuals are organized as:
```
manuals/
├── rona/
│   ├── SKU123_Installation_Guide.pdf
│   ├── SKU456_User_Manual.pdf
│   └── download_log.json
└── canadiantire/
    ├── MODEL789_Assembly_Instructions.pdf
    └── download_log.json
```

### Product Data Schema

Each product item contains:

```json
{
  "url": "https://www.rona.ca/en/product/...",
  "name": "Product Name",
  "brand": "Brand Name",
  "model": "Model Number",
  "sku": "SKU123456",
  "price": 99.99,
  "description": "Product description...",
  "specifications": {
    "Dimension": "10 x 5 x 3 inches",
    "Weight": "2.5 lbs"
  },
  "category": "Tools",
  "subcategory": "Power Tools",
  "images": ["url1", "url2"],
  "manuals": [
    {
      "url": "https://example.com/manual.pdf",
      "title": "Installation Guide",
      "type": "pdf",
      "local_path": "./manuals/rona/SKU123_Installation_Guide.pdf"
    }
  ],
  "documents": [...],
  "features": ["Feature 1", "Feature 2"],
  "availability": "In Stock",
  "rating": 4.5,
  "warranty": "2 years",
  "scraped_at": "2024-01-15T10:30:00",
  "site": "rona"
}
```

## Configuration

### Adding New Sites

To add a new hardware store website:

1. Add configuration to `config.py`:
```python
SITES_CONFIG['newsite'] = {
    'name': 'New Hardware Store',
    'base_url': 'https://www.newsite.com',
    'sitemap_url': 'https://www.newsite.com/sitemap.xml',
    'allowed_domains': ['newsite.com'],
    'user_agent': 'Mozilla/5.0...',
    'download_delay': 2,
    'concurrent_requests': 8,
}
```

2. Add extraction method to `hardware_spider.py`:
```python
def extract_newsite_data(self, response, item):
    # Implement site-specific extraction logic
    pass
```

### Customizing Categories

Edit `TARGET_CATEGORIES` in `config.py` to focus on specific product categories:

```python
TARGET_CATEGORIES = [
    'tools',
    'appliances',
    'hardware',
    # Add more categories as needed
]
```

## Rate Limiting & Ethics

The scraper implements several measures to be respectful:

- **robots.txt compliance**: Automatically respects robots.txt directives
- **Rate limiting**: Configurable delays between requests (default: 2 seconds)
- **Auto-throttling**: Automatically adjusts request rate based on response times
- **Concurrent request limits**: Limits simultaneous requests per domain
- **User agent rotation**: Uses realistic browser user agents

Please ensure you comply with the website's terms of service and robots.txt file.

## Troubleshooting

### Common Issues

1. **403 Forbidden errors**: The site may have anti-bot protection. Try:
   - Increasing download delay
   - Using different user agents
   - Running with lower concurrency

2. **Empty results**: Check if:
   - The site's sitemap structure has changed
   - Product URL patterns have changed
   - CSS selectors need updating

3. **Manual download failures**: Verify:
   - Manual URLs are accessible
   - Sufficient disk space
   - Network connectivity

### Debug Mode

Run with debug logging:
```bash
scrapy crawl hardware -a site=rona -L DEBUG
```

Enable auto-throttle debugging:
```bash
scrapy crawl hardware -a site=rona -s AUTOTHROTTLE_DEBUG=True
```

## Data Usage for RAG

The structured output is optimized for RAG (Retrieval-Augmented Generation) applications:

1. **Product descriptions** provide context for user queries
2. **Specifications** offer technical details for specific questions
3. **Instruction manuals** contain detailed procedural information
4. **Categories and features** enable semantic search and filtering

### Recommended Vectorization Strategy

1. **Chunk product data** by logical sections (description, specs, features)
2. **Process manuals** using PDF text extraction
3. **Create embeddings** for product titles, descriptions, and manual content
4. **Index by category** for efficient retrieval
5. **Include metadata** (brand, model, price) for enhanced context

## License

This project is for educational and research purposes. Please respect the terms of service of the websites you scrape.