#!/usr/bin/env python3
"""
Final Summary of Comprehensive Drilling Equipment Database
"""

import json
import glob

def show_final_summary():
    # Load the comprehensive dataset
    data_files = glob.glob('./data/comprehensive_drilling_data_*.json')
    latest_file = max(data_files)
    
    with open(latest_file, 'r') as f:
        data = json.load(f)
    
    print('🔨 COMPREHENSIVE DRILLING EQUIPMENT DATABASE')
    print('=' * 60)
    print(f'📊 SUMMARY:')
    print(f'   • Total Drills: {len(data["drills"])}')
    print(f'   • Total Drill Bit Sets: {len(data["drill_bits"])}')
    print(f'   • Total Products: {data["metadata"]["total_products"]}')
    print(f'   • Brands: {len(data["metadata"]["brands"])}')
    
    print(f'\n🔧 DRILL TYPES ({len(data["drills"])} total):')
    for drill in data['drills']:
        drill_type = drill["drill_type"].replace("_", " ").title()
        print(f'   • {drill["name"]} - ${drill["price"]} ({drill_type})')
    
    print(f'\n🔩 DRILL BIT TYPES ({len(data["drill_bits"])} total):')
    for bit in data['drill_bits']:
        bit_type = bit["bit_type"].replace("_", " ").title()
        print(f'   • {bit["name"]} - ${bit["price"]} ({bit_type})')
    
    print(f'\n🏷️ BRANDS COVERED:')
    for brand in sorted(data['metadata']['brands']):
        print(f'   • {brand}')
    
    print(f'\n💰 PRICE RANGES:')
    drill_prices = [d['price'] for d in data['drills']]
    bit_prices = [b['price'] for b in data['drill_bits']]
    print(f'   • Drills: ${min(drill_prices):.2f} - ${max(drill_prices):.2f}')
    print(f'   • Drill Bits: ${min(bit_prices):.2f} - ${max(bit_prices):.2f}')
    
    print(f'\n🎯 PERFECT FOR RAG QUERIES:')
    queries = [
        "What drill should I use for concrete work?",
        "What size drill bit do I need for #10 screws?", 
        "Best cordless drill under $200?",
        "What drill bits work best with stainless steel?",
        "I need to drill holes in ceramic tile, what should I use?",
        "What's the difference between impact driver and regular drill?",
        "What drill bit sizes come in the DEWALT black oxide set?",
        "I need a drill for tight spaces, what do you recommend?",
        "What's the drilling capacity of the Milwaukee hammer drill?",
        "Best drill bits for woodworking projects?"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f'   {i:2d}. "{query}"')
    
    print(f'\n📁 FILES CREATED:')
    print(f'   • Complete Dataset: {latest_file}')
    
    rag_files = glob.glob('./data/drilling_rag_chunks_*.json')
    if rag_files:
        latest_rag = max(rag_files)
        print(f'   • RAG Chunks: {latest_rag}')
        
        with open(latest_rag, 'r') as f:
            chunks = json.load(f)
        print(f'   • Total RAG Chunks: {len(chunks)}')
    
    print(f'\n✅ READY FOR RAG IMPLEMENTATION!')
    print(f'   Your comprehensive drilling equipment database is complete')
    print(f'   and optimized for semantic search and question answering.')

if __name__ == "__main__":
    show_final_summary()