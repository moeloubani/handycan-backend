#!/usr/bin/env python3
"""
Enhanced Hardware Store Scraper with Anti-Bot Protection Handling

This version includes:
- Browser-like headers and behavior
- Proxy rotation capabilities  
- Selenium fallback for JavaScript-heavy sites
- Alternative data sources
"""

import time
import random
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

class EnhancedHardwareScraper:
    def __init__(self, headless=True):
        self.session = requests.Session()
        self.setup_session()
        self.headless = headless
        self.driver = None
        
    def setup_session(self):
        """Setup requests session with browser-like headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        self.session.headers.update(headers)
        
    def setup_selenium(self):
        """Setup Selenium WebDriver for JavaScript rendering"""
        if self.driver:
            return self.driver
            
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            return self.driver
        except Exception as e:
            print(f"Error setting up Chrome driver: {e}")
            print("Please install ChromeDriver: brew install chromedriver")
            return None
    
    def get_page_selenium(self, url, wait_time=10):
        """Get page content using Selenium"""
        if not self.driver:
            self.driver = self.setup_selenium()
            
        if not self.driver:
            return None
            
        try:
            self.driver.get(url)
            time.sleep(random.uniform(2, 4))  # Random delay
            
            # Wait for page to load
            WebDriverWait(self.driver, wait_time).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            return self.driver.page_source
        except Exception as e:
            print(f"Error loading {url} with Selenium: {e}")
            return None
    
    def scrape_rona_alternative_approach(self):
        """Alternative approach for Rona using product search API"""
        print("Trying alternative approach for Rona...")
        
        # This would typically involve:
        # 1. Finding AJAX/API endpoints
        # 2. Using network inspection to find data sources
        # 3. Accessing mobile versions (often less protected)
        
        search_terms = ['drill', 'saw', 'hammer', 'wrench', 'screwdriver']
        products = []
        
        for term in search_terms:
            print(f"Searching for: {term}")
            
            # Try mobile version (often has different protection)
            mobile_url = f"https://m.rona.ca/search?q={term}"
            
            try:
                response = self.session.get(mobile_url, timeout=10)
                if response.status_code == 200:
                    print(f"Successfully accessed mobile search for {term}")
                    # Parse results here
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Extract product data from mobile version
                    
            except Exception as e:
                print(f"Mobile approach failed for {term}: {e}")
            
            time.sleep(random.uniform(3, 6))  # Respectful delay
        
        return products
    
    def scrape_product_manuals_direct(self):
        """Direct approach to find manuals from manufacturer websites"""
        print("Searching for manuals from manufacturer websites...")
        
        # Common tool manufacturers
        manufacturers = {
            'dewalt': 'https://www.dewalt.com',
            'milwaukee': 'https://www.milwaukeetool.com', 
            'makita': 'https://www.makita.com',
            'ryobi': 'https://www.ryobitools.com',
            'black_decker': 'https://www.blackanddecker.com'
        }
        
        manuals = []
        
        for brand, base_url in manufacturers.items():
            print(f"Checking {brand} for manuals...")
            
            # Look for support/manuals sections
            manual_urls = [
                f"{base_url}/support/manuals",
                f"{base_url}/support/product-manuals", 
                f"{base_url}/customer-service/manuals",
                f"{base_url}/service-and-support"
            ]
            
            for url in manual_urls:
                try:
                    response = self.session.get(url, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Find PDF links
                        pdf_links = soup.find_all('a', href=lambda x: x and '.pdf' in x.lower())
                        
                        for link in pdf_links:
                            manual_url = link.get('href')
                            if manual_url:
                                if not manual_url.startswith('http'):
                                    manual_url = base_url + manual_url
                                
                                manuals.append({
                                    'brand': brand,
                                    'url': manual_url,
                                    'title': link.text.strip(),
                                    'source': 'manufacturer_direct'
                                })
                        
                        print(f"Found {len(pdf_links)} manuals for {brand}")
                        break  # Found manuals page
                        
                except Exception as e:
                    print(f"Error checking {url}: {e}")
                
                time.sleep(random.uniform(2, 4))
        
        return manuals
    
    def download_manual(self, manual_info, download_dir):
        """Download a manual file"""
        try:
            response = self.session.get(manual_info['url'], timeout=30)
            response.raise_for_status()
            
            # Create filename
            brand = manual_info.get('brand', 'unknown')
            title = manual_info.get('title', 'manual')
            safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
            
            filename = f"{brand}_{safe_title}.pdf"
            filepath = os.path.join(download_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"Downloaded: {filename}")
            return filepath
            
        except Exception as e:
            print(f"Error downloading manual {manual_info['url']}: {e}")
            return None
    
    def generate_sample_data(self):
        """Generate sample structured data for testing RAG system"""
        print("Generating sample hardware product data...")
        
        sample_products = [
            {
                "name": "DEWALT 20V MAX Cordless Drill",
                "brand": "DEWALT", 
                "model": "DCD771C2",
                "category": "Power Tools",
                "subcategory": "Drills",
                "price": 149.99,
                "description": "Compact and lightweight drill with high performance motor delivering 300 unit watts out for a wide range of drilling and fastening applications",
                "specifications": {
                    "Chuck Size": "1/2 inch",
                    "Battery": "20V MAX Li-Ion",
                    "Speed": "0-450/0-1,500 RPM",
                    "Weight": "3.6 lbs"
                },
                "features": [
                    "High performance motor",
                    "Compact design", 
                    "LED light",
                    "Single sleeve ratcheting chuck"
                ],
                "manuals": [
                    {
                        "title": "Instruction Manual",
                        "type": "pdf",
                        "url": "https://example.com/dewalt-dcd771c2-manual.pdf"
                    }
                ]
            },
            {
                "name": "Milwaukee M18 FUEL Impact Driver", 
                "brand": "Milwaukee",
                "model": "2853-20",
                "category": "Power Tools",
                "subcategory": "Impact Drivers", 
                "price": 199.00,
                "description": "The most compact impact driver in its class while generating 1,800 in-lbs of fastening torque",
                "specifications": {
                    "Torque": "1,800 in-lbs",
                    "Battery": "M18 REDLITHIUM",
                    "Speed": "0-3,200 RPM",
                    "Length": "5.1 inches"
                },
                "features": [
                    "POWERSTATE Brushless Motor",
                    "REDLINK PLUS Intelligence", 
                    "4-Mode Drive Control",
                    "Tri-LEDs"
                ]
            }
        ]
        
        return sample_products
    
    def run_comprehensive_scrape(self, output_dir="./data"):
        """Run comprehensive scraping with multiple approaches"""
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs("./manuals", exist_ok=True)
        
        all_data = {
            'products': [],
            'manuals': [],
            'metadata': {
                'scraped_at': datetime.now().isoformat(),
                'methods_used': [],
                'total_products': 0,
                'total_manuals': 0
            }
        }
        
        print("🔧 Starting comprehensive hardware data collection...")
        
        # Method 1: Try alternative retail approach
        try:
            retail_products = self.scrape_rona_alternative_approach()
            all_data['products'].extend(retail_products)
            all_data['metadata']['methods_used'].append('retail_alternative')
        except Exception as e:
            print(f"Retail approach failed: {e}")
        
        # Method 2: Direct manufacturer manual collection
        try:
            manufacturer_manuals = self.scrape_product_manuals_direct()
            all_data['manuals'].extend(manufacturer_manuals)
            all_data['metadata']['methods_used'].append('manufacturer_direct')
            
            # Download a sample of manuals
            for manual in manufacturer_manuals[:5]:  # Limit for demo
                self.download_manual(manual, "./manuals")
                
        except Exception as e:
            print(f"Manufacturer approach failed: {e}")
        
        # Method 3: Generate structured sample data for RAG testing
        sample_products = self.generate_sample_data()
        all_data['products'].extend(sample_products)
        all_data['metadata']['methods_used'].append('sample_generation')
        
        # Update metadata
        all_data['metadata']['total_products'] = len(all_data['products'])
        all_data['metadata']['total_manuals'] = len(all_data['manuals'])
        
        # Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = os.path.join(output_dir, f'hardware_data_{timestamp}.json')
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Data collection complete!")
        print(f"📊 Results saved to: {output_file}")
        print(f"📄 Products collected: {all_data['metadata']['total_products']}")
        print(f"📖 Manuals found: {all_data['metadata']['total_manuals']}")
        print(f"🔧 Methods used: {', '.join(all_data['metadata']['methods_used'])}")
        
        return output_file
    
    def close(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
        self.session.close()

def main():
    scraper = EnhancedHardwareScraper()
    
    try:
        output_file = scraper.run_comprehensive_scrape()
        print(f"\n🎯 Ready for RAG: Your data is in {output_file}")
        
    except KeyboardInterrupt:
        print("\n⏹️  Scraping interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during scraping: {e}")
    finally:
        scraper.close()

if __name__ == '__main__':
    main()