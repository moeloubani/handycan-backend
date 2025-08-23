#!/usr/bin/env python3
"""
Export Raw Hardware Data - No Pre-chunking

Creates clean, structured data without any RAG chunking,
giving you full control over how to process it.
"""

import json
import os
from datetime import datetime

def create_raw_export():
    """Create raw export data with no pre-chunking"""
    
    # Load the comprehensive dataset
    import glob
    data_files = glob.glob('./data/comprehensive_drilling_data_*.json')
    if not data_files:
        print("No comprehensive data files found. Run comprehensive_drill_data.py first.")
        return
        
    latest_file = max(data_files)
    with open(latest_file, 'r') as f:
        data = json.load(f)
    
    # Create raw format - just clean product data
    raw_export = {
        "metadata": {
            "export_type": "raw_hardware_data",
            "created_at": datetime.now().isoformat(),
            "description": "Raw hardware store data without pre-chunking for custom RAG processing",
            "total_products": len(data["drills"]) + len(data["drill_bits"]),
            "data_structure": "Single products with all attributes in one object",
            "chunking_note": "No pre-chunking applied - process as needed for your RAG system"
        },
        "products": []
    }
    
    # Process drills into raw format
    for drill in data["drills"]:
        raw_product = {
            "id": drill["id"],
            "name": drill["name"],
            "brand": drill["brand"],
            "model": drill["model"],
            "category": drill["category"],
            "subcategory": drill["subcategory"],
            "product_type": "drill",
            "drill_type": drill["drill_type"],
            "price": drill["price"],
            
            # Full description text
            "description": drill["description"],
            
            # All specifications as structured data
            "specifications": drill["specifications"],
            
            # Drilling capabilities
            "drilling_capacity": drill.get("drilling_capacity", {}),
            
            # Applications list
            "applications": drill.get("applications", []),
            
            # Additional fields if present
            "features": drill.get("features", []),
            "included_items": drill.get("included_items", []),
            "warranty": drill.get("warranty", ""),
            "safety_info": drill.get("safety_info", []),
            
            # Special drill-specific data
            "four_mode_drive_control": drill.get("four_mode_drive_control", {}),
            
            # Full text content for search/chunking
            "full_text_content": create_full_text_content_drill(drill)
        }
        
        raw_export["products"].append(raw_product)
    
    # Process drill bits into raw format  
    for bit in data["drill_bits"]:
        raw_product = {
            "id": bit["id"],
            "name": bit["name"],
            "brand": bit["brand"],
            "model": bit["model"],
            "category": bit["category"],
            "subcategory": bit["subcategory"],
            "product_type": "drill_bit",
            "bit_type": bit["bit_type"],
            "price": bit["price"],
            
            # Full description text
            "description": bit["description"],
            
            # All specifications as structured data
            "specifications": bit["specifications"],
            
            # Size information
            "size_range": bit.get("size_range", {}),
            
            # Materials this bit can drill
            "materials_drilled": bit.get("materials_drilled", []),
            
            # Applications list
            "applications": bit.get("applications", []),
            
            # Additional fields if present
            "features": bit.get("features", []),
            "warranty": bit.get("warranty", ""),
            "safety_info": bit.get("safety_info", []),
            
            # Full text content for search/chunking
            "full_text_content": create_full_text_content_bit(bit)
        }
        
        raw_export["products"].append(raw_product)
    
    return raw_export

def create_full_text_content_drill(drill):
    """Create full text content for a drill without chunking"""
    
    content_parts = []
    
    # Basic info
    content_parts.append(f"Product Name: {drill['name']}")
    content_parts.append(f"Brand: {drill['brand']}")
    content_parts.append(f"Model: {drill['model']}")
    content_parts.append(f"Type: {drill['drill_type'].replace('_', ' ').title()}")
    content_parts.append(f"Price: ${drill['price']}")
    
    # Description
    content_parts.append(f"Description: {drill['description']}")
    
    # Specifications
    if drill.get("specifications"):
        content_parts.append("Specifications:")
        for key, value in drill["specifications"].items():
            content_parts.append(f"  {key}: {value}")
    
    # Drilling capacity
    if drill.get("drilling_capacity"):
        content_parts.append("Drilling Capacity:")
        for material, capacity in drill["drilling_capacity"].items():
            content_parts.append(f"  {material}: {capacity}")
    
    # Applications
    if drill.get("applications"):
        content_parts.append(f"Applications: {', '.join(drill['applications'])}")
    
    # Features
    if drill.get("features"):
        content_parts.append("Key Features:")
        for feature in drill["features"]:
            content_parts.append(f"  • {feature}")
    
    # Included items
    if drill.get("included_items"):
        content_parts.append("Included Items:")
        for item in drill["included_items"]:
            content_parts.append(f"  • {item}")
    
    # Special modes (for impact drivers, etc.)
    if drill.get("four_mode_drive_control"):
        content_parts.append("Drive Control Modes:")
        for mode, description in drill["four_mode_drive_control"].items():
            content_parts.append(f"  {mode}: {description}")
    
    # Safety info
    if drill.get("safety_info"):
        content_parts.append("Safety Information:")
        for safety in drill["safety_info"]:
            content_parts.append(f"  • {safety}")
    
    # Warranty
    if drill.get("warranty"):
        content_parts.append(f"Warranty: {drill['warranty']}")
    
    return "\n".join(content_parts)

def create_full_text_content_bit(bit):
    """Create full text content for drill bits without chunking"""
    
    content_parts = []
    
    # Basic info
    content_parts.append(f"Product Name: {bit['name']}")
    content_parts.append(f"Brand: {bit['brand']}")
    content_parts.append(f"Model: {bit['model']}")
    content_parts.append(f"Type: {bit['bit_type'].replace('_', ' ').title()}")
    content_parts.append(f"Price: ${bit['price']}")
    
    # Description
    content_parts.append(f"Description: {bit['description']}")
    
    # Specifications
    if bit.get("specifications"):
        content_parts.append("Specifications:")
        for key, value in bit["specifications"].items():
            content_parts.append(f"  {key}: {value}")
    
    # Size range
    if bit.get("size_range"):
        content_parts.append("Size Range:")
        for key, value in bit["size_range"].items():
            content_parts.append(f"  {key}: {value}")
    
    # Materials
    if bit.get("materials_drilled"):
        content_parts.append(f"Materials: {', '.join(bit['materials_drilled'])}")
    
    # Applications
    if bit.get("applications"):
        content_parts.append(f"Applications: {', '.join(bit['applications'])}")
    
    # Features
    if bit.get("features"):
        content_parts.append("Key Features:")
        for feature in bit["features"]:
            content_parts.append(f"  • {feature}")
    
    # Safety info
    if bit.get("safety_info"):
        content_parts.append("Safety Information:")
        for safety in bit["safety_info"]:
            content_parts.append(f"  • {safety}")
    
    # Warranty
    if bit.get("warranty"):
        content_parts.append(f"Warranty: {bit['warranty']}")
    
    return "\n".join(content_parts)

def save_raw_export():
    """Save the raw export data"""
    
    raw_data = create_raw_export()
    if not raw_data:
        return
    
    # Save to file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"./data/raw_hardware_data_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(raw_data, f, indent=2, ensure_ascii=False)
    
    print(f"🔧 Raw Hardware Data Export Complete!")
    print(f"📁 File: {filename}")
    print(f"📊 Products: {raw_data['metadata']['total_products']}")
    print(f"💾 Size: {os.path.getsize(filename)} bytes")
    
    # Show sample product structure
    sample_product = raw_data["products"][0]
    print(f"\n📋 Sample Product Structure:")
    print(f"   • ID: {sample_product['id']}")
    print(f"   • Name: {sample_product['name']}")
    print(f"   • Product Type: {sample_product['product_type']}")
    print(f"   • Full Text Length: {len(sample_product['full_text_content'])} characters")
    print(f"   • Structured Fields: {len([k for k in sample_product.keys() if k != 'full_text_content'])}")
    
    print(f"\n🎯 Ready for Custom Chunking!")
    print(f"   • Use 'full_text_content' for basic text chunking")
    print(f"   • Use individual fields for structured chunking") 
    print(f"   • Use metadata fields for filtering")
    
    return filename

if __name__ == "__main__":
    save_raw_export()