#!/usr/bin/env python3
"""
Hardware Store Scraper Runner

This script provides a simple interface to run the hardware store scraper
for different sites with various configuration options.
"""

import os
import sys
import argparse
import subprocess
from datetime import datetime
from config import SITES_CONFIG

def run_scraper(site, limit=None, categories=None, output_dir=None):
    """Run the scrapy spider with specified parameters"""
    
    if site not in SITES_CONFIG:
        print(f"Error: Site '{site}' not configured.")
        print(f"Available sites: {list(SITES_CONFIG.keys())}")
        return False
    
    # Prepare scrapy command
    cmd = ['scrapy', 'crawl', 'hardware', '-a', f'site={site}']
    
    # Add custom settings if specified
    if limit:
        cmd.extend(['-s', f'CLOSESPIDER_ITEMCOUNT={limit}'])
    
    if output_dir:
        cmd.extend(['-s', f'FEEDS_STORE_EMPTY=false'])
        # Update output directory in feeds
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        json_feed = f'{output_dir}/products_{site}_{timestamp}.json'
        csv_feed = f'{output_dir}/products_{site}_{timestamp}.csv'
        cmd.extend(['-O', json_feed])
    
    # Set log level
    cmd.extend(['-L', 'INFO'])
    
    print(f"Starting scraper for {SITES_CONFIG[site]['name']}...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, cwd=os.path.dirname(__file__))
        print(f"Scraping completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Scraping failed with error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Run hardware store scraper')
    
    parser.add_argument(
        'site',
        choices=list(SITES_CONFIG.keys()),
        help='Site to scrape'
    )
    
    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Limit number of items to scrape (for testing)'
    )
    
    parser.add_argument(
        '--output-dir', '-o',
        type=str,
        default='./data',
        help='Output directory for scraped data'
    )
    
    parser.add_argument(
        '--categories', '-c',
        nargs='+',
        help='Specific categories to scrape'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show command that would be run without executing'
    )
    
    parser.add_argument(
        '--list-sites',
        action='store_true',
        help='List available sites and exit'
    )
    
    args = parser.parse_args()
    
    if args.list_sites:
        print("Available sites:")
        for site_key, site_config in SITES_CONFIG.items():
            print(f"  {site_key}: {site_config['name']} ({site_config['base_url']})")
        return
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    if args.dry_run:
        print(f"Would run scraper for {args.site} with:")
        print(f"  Limit: {args.limit}")
        print(f"  Output dir: {args.output_dir}")
        print(f"  Categories: {args.categories}")
        return
    
    # Run the scraper
    success = run_scraper(
        site=args.site,
        limit=args.limit,
        categories=args.categories,
        output_dir=args.output_dir
    )
    
    if success:
        print(f"\nData saved to: {args.output_dir}")
        print(f"Manuals saved to: ./manuals/{args.site}")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()