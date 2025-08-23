import json
import os
import hashlib
import requests
from datetime import datetime
from urllib.parse import urlparse
from scrapy.exceptions import DropItem
from scrapy.pipelines.files import FilesPipeline
from scrapy.http import Request
import logging

class ValidationPipeline:
    """Validate that items have required fields"""
    
    def process_item(self, item, spider):
        if not item.get('name'):
            raise DropItem(f"Missing product name: {item.get('url', 'unknown')}")
        
        if not item.get('url'):
            raise DropItem("Missing product URL")
        
        return item

class DuplicatesPipeline:
    """Filter out duplicate items based on URL"""
    
    def __init__(self):
        self.urls_seen = set()
    
    def process_item(self, item, spider):
        url = item.get('url')
        if url in self.urls_seen:
            raise DropItem(f"Duplicate item found: {url}")
        else:
            self.urls_seen.add(url)
            return item

class ManualDownloadPipeline:
    """Download instruction manuals and documents"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def open_spider(self, spider):
        # Create manuals directory
        self.manuals_dir = os.path.join('manuals', spider.site_name)
        os.makedirs(self.manuals_dir, exist_ok=True)
        
        # Create download log
        self.download_log = []
    
    def process_item(self, item, spider):
        # Download manuals
        if item.get('manuals'):
            downloaded_manuals = []
            for manual in item['manuals']:
                try:
                    downloaded_file = self.download_file(
                        manual['url'], 
                        manual.get('title', 'manual'),
                        item.get('sku', ''),
                        spider
                    )
                    if downloaded_file:
                        manual['local_path'] = downloaded_file
                        downloaded_manuals.append(manual)
                        self.logger.info(f"Downloaded manual: {downloaded_file}")
                except Exception as e:
                    self.logger.error(f"Failed to download manual {manual['url']}: {e}")
                    downloaded_manuals.append(manual)  # Keep original URL
            
            item['manuals'] = downloaded_manuals
        
        # Download documents
        if item.get('documents'):
            downloaded_docs = []
            for doc in item['documents']:
                try:
                    downloaded_file = self.download_file(
                        doc['url'],
                        doc.get('title', 'document'),
                        item.get('sku', ''),
                        spider
                    )
                    if downloaded_file:
                        doc['local_path'] = downloaded_file
                        downloaded_docs.append(doc)
                        self.logger.info(f"Downloaded document: {downloaded_file}")
                except Exception as e:
                    self.logger.error(f"Failed to download document {doc['url']}: {e}")
                    downloaded_docs.append(doc)  # Keep original URL
            
            item['documents'] = downloaded_docs
        
        return item
    
    def download_file(self, url, title, sku, spider):
        """Download a file and return the local path"""
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            # Generate filename
            parsed_url = urlparse(url)
            file_ext = os.path.splitext(parsed_url.path)[1] or '.pdf'
            
            # Clean title for filename
            safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_title = safe_title[:50]  # Limit length
            
            # Create filename with SKU if available
            if sku:
                filename = f"{sku}_{safe_title}{file_ext}"
            else:
                # Use URL hash as fallback
                url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                filename = f"{url_hash}_{safe_title}{file_ext}"
            
            filepath = os.path.join(self.manuals_dir, filename)
            
            # Download file
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Log download
            self.download_log.append({
                'url': url,
                'local_path': filepath,
                'title': title,
                'sku': sku,
                'downloaded_at': datetime.now().isoformat()
            })
            
            return filepath
            
        except Exception as e:
            self.logger.error(f"Error downloading {url}: {e}")
            return None
    
    def close_spider(self, spider):
        # Save download log
        log_file = os.path.join(self.manuals_dir, 'download_log.json')
        with open(log_file, 'w') as f:
            json.dump(self.download_log, f, indent=2)

class JsonWriterPipeline:
    """Write items to JSON file with additional metadata"""
    
    def open_spider(self, spider):
        # Create data directory
        os.makedirs('data', exist_ok=True)
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.filename = f'data/products_{spider.site_name}_{timestamp}.json'
        
        self.file = open(self.filename, 'w', encoding='utf-8')
        self.file.write('[\n')
        self.first_item = True
        
        # Metadata
        self.metadata = {
            'scrape_info': {
                'site': spider.site_name,
                'started_at': datetime.now().isoformat(),
                'spider_name': spider.name,
            },
            'stats': {
                'total_items': 0,
                'items_with_manuals': 0,
                'items_with_documents': 0,
            }
        }
    
    def process_item(self, item, spider):
        # Update stats
        self.metadata['stats']['total_items'] += 1
        if item.get('manuals'):
            self.metadata['stats']['items_with_manuals'] += 1
        if item.get('documents'):
            self.metadata['stats']['items_with_documents'] += 1
        
        # Write item to file
        if not self.first_item:
            self.file.write(',\n')
        else:
            self.first_item = False
        
        item_dict = dict(item)
        json.dump(item_dict, self.file, ensure_ascii=False, indent=2)
        
        return item
    
    def close_spider(self, spider):
        self.metadata['scrape_info']['completed_at'] = datetime.now().isoformat()
        
        # Close items array and add metadata
        self.file.write('\n]\n')
        self.file.close()
        
        # Save metadata separately
        metadata_file = self.filename.replace('.json', '_metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, indent=2)
        
        spider.logger.info(f"Saved {self.metadata['stats']['total_items']} items to {self.filename}")
        spider.logger.info(f"Metadata saved to {metadata_file}")

class CSVWriterPipeline:
    """Write items to CSV format for easy analysis"""
    
    def open_spider(self, spider):
        import csv
        
        os.makedirs('data', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.filename = f'data/products_{spider.site_name}_{timestamp}.csv'
        
        self.file = open(self.filename, 'w', newline='', encoding='utf-8')
        
        # Define CSV columns
        self.fieldnames = [
            'url', 'name', 'brand', 'model', 'sku', 'price', 'category',
            'subcategory', 'description', 'availability', 'rating',
            'warranty', 'dimensions', 'weight', 'manual_count',
            'document_count', 'scraped_at', 'site'
        ]
        
        self.writer = csv.DictWriter(self.file, fieldnames=self.fieldnames)
        self.writer.writeheader()
    
    def process_item(self, item, spider):
        # Flatten item for CSV
        csv_item = {}
        for field in self.fieldnames:
            if field in ['manual_count', 'document_count']:
                if field == 'manual_count':
                    csv_item[field] = len(item.get('manuals', []))
                else:
                    csv_item[field] = len(item.get('documents', []))
            else:
                value = item.get(field, '')
                # Convert lists/dicts to strings
                if isinstance(value, (list, dict)):
                    csv_item[field] = str(value)
                else:
                    csv_item[field] = value
        
        self.writer.writerow(csv_item)
        return item
    
    def close_spider(self, spider):
        self.file.close()
        spider.logger.info(f"CSV data saved to {self.filename}")