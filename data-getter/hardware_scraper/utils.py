import re
import requests
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse
import gzip
import io
from typing import List, Dict, Optional

def parse_sitemap(sitemap_url: str) -> List[str]:
    """Parse sitemap XML and extract product URLs"""
    try:
        response = requests.get(sitemap_url, timeout=30)
        response.raise_for_status()
        
        if sitemap_url.endswith('.gz'):
            content = gzip.decompress(response.content)
        else:
            content = response.content
            
        root = ET.fromstring(content)
        
        urls = []
        for url_elem in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url'):
            loc_elem = url_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
            if loc_elem is not None:
                urls.append(loc_elem.text)
        
        return urls
    except Exception as e:
        print(f"Error parsing sitemap {sitemap_url}: {e}")
        return []

def get_sitemap_index(sitemap_url: str) -> List[str]:
    """Get list of sitemap URLs from sitemap index"""
    try:
        response = requests.get(sitemap_url, timeout=30)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        sitemap_urls = []
        
        for sitemap_elem in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}sitemap'):
            loc_elem = sitemap_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
            if loc_elem is not None:
                sitemap_urls.append(loc_elem.text)
        
        return sitemap_urls
    except Exception as e:
        print(f"Error parsing sitemap index {sitemap_url}: {e}")
        return []

def filter_product_urls(urls: List[str], target_categories: List[str]) -> List[str]:
    """Filter URLs to only include product pages from target categories"""
    product_urls = []
    
    for url in urls:
        url_lower = url.lower()
        
        # Look for product patterns
        if any(cat in url_lower for cat in target_categories):
            # Exclude non-product pages
            if not any(exclude in url_lower for exclude in [
                '/search', '/filter', '/category', '/brand', '/store',
                '/about', '/contact', '/help', '/login', '/account'
            ]):
                product_urls.append(url)
    
    return product_urls

def extract_text_content(element) -> str:
    """Extract clean text content from scrapy selector"""
    if element:
        text = ' '.join(element.getall()).strip()
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        return text
    return ""

def extract_price(price_text: str) -> Optional[float]:
    """Extract numeric price from price text"""
    if not price_text:
        return None
    
    # Remove currency symbols and extract number
    price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
    if price_match:
        try:
            return float(price_match.group().replace(',', ''))
        except ValueError:
            pass
    return None

def clean_specifications(specs_dict: Dict) -> Dict:
    """Clean and normalize specifications dictionary"""
    cleaned = {}
    for key, value in specs_dict.items():
        if isinstance(value, str):
            value = value.strip()
            if value and value.lower() not in ['n/a', 'not applicable', '-', '']:
                cleaned[key.strip()] = value
        elif value is not None:
            cleaned[key.strip()] = value
    return cleaned

def is_manual_link(url: str, text: str = "") -> bool:
    """Check if a URL or link text indicates an instruction manual"""
    manual_indicators = [
        'manual', 'instruction', 'guide', 'installation', 'assembly',
        'user guide', 'owner', 'setup', 'quick start', 'operation',
        '.pdf', 'download', 'document'
    ]
    
    url_lower = url.lower()
    text_lower = text.lower()
    
    return any(indicator in url_lower or indicator in text_lower 
              for indicator in manual_indicators)

def normalize_url(url: str, base_url: str) -> str:
    """Normalize relative URLs to absolute URLs"""
    if url.startswith('http'):
        return url
    return urljoin(base_url, url)