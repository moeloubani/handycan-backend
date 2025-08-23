#!/usr/bin/env python3
"""
Data Summary Script - Shows what data was collected for RAG system
"""

import json
import os
import glob

def analyze_collected_data():
    print("🔍 Hardware Store Data Collection Summary\n")
    
    # Find all data files
    data_files = glob.glob("./data/*.json")
    csv_files = glob.glob("./data/*.csv")
    
    print(f"📁 Total files generated: {len(data_files + csv_files)}")
    print(f"   - JSON files: {len(data_files)}")
    print(f"   - CSV files: {len(csv_files)}")
    
    # Analyze the main datasets
    for file_path in data_files:
        if "complete_hardware_data" in file_path:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            print(f"\n📊 Complete Dataset: {os.path.basename(file_path)}")
            print(f"   - Products: {data['metadata']['total_products']}")
            print(f"   - Categories: {', '.join(data['metadata']['categories'])}")
            print(f"   - Brands: {', '.join(data['metadata']['brands'])}")
            
            # Show sample product
            sample = data['products'][0]
            print(f"\n📋 Sample Product:")
            print(f"   - Name: {sample['name']}")
            print(f"   - Brand: {sample['brand']} (Model: {sample['model']})")
            print(f"   - Price: ${sample['price']}")
            print(f"   - Specifications: {len(sample['specifications'])} items")
            print(f"   - Features: {len(sample['features'])} features")
            print(f"   - Manuals: {len(sample.get('manuals', []))} documents")
        
        elif "rag_chunks" in file_path:
            with open(file_path, 'r') as f:
                chunks = json.load(f)
            
            print(f"\n🧠 RAG Chunks: {os.path.basename(file_path)}")
            print(f"   - Total chunks: {len(chunks)}")
            
            # Analyze chunk types
            chunk_types = {}
            for chunk in chunks:
                chunk_type = chunk['type']
                chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
            
            print(f"   - Chunk types:")
            for chunk_type, count in chunk_types.items():
                print(f"     • {chunk_type}: {count} chunks")
            
            # Show sample chunk
            sample_chunk = chunks[0]
            print(f"\n📝 Sample RAG Chunk:")
            print(f"   - ID: {sample_chunk['id']}")
            print(f"   - Type: {sample_chunk['type']}")
            print(f"   - Content: {sample_chunk['content'][:100]}...")
    
    print(f"\n🎯 RAG Implementation Ready!")
    print(f"   ✅ Structured product data")
    print(f"   ✅ Pre-chunked content for vectorization")
    print(f"   ✅ Rich metadata for filtering")
    print(f"   ✅ Multiple output formats")
    
    print(f"\n📖 Next Steps for RAG:")
    print(f"   1. Load the RAG chunks JSON file")
    print(f"   2. Create embeddings for each chunk's content")
    print(f"   3. Store embeddings in vector database (Pinecone, Weaviate, etc.)")
    print(f"   4. Use metadata for filtering during retrieval")
    print(f"   5. Implement semantic search over product data")
    
    return data_files, csv_files

if __name__ == "__main__":
    analyze_collected_data()