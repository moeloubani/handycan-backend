# 📁 Hardware Store Data Export Guide

## 🎯 **Main Files for Your RAG Project**

### **Primary Export File (RECOMMENDED)**
```
📄 drilling_rag_chunks_20250816_181154.json
```
- **92 pre-chunked pieces** ready for vectorization
- **Optimized for RAG** with metadata for filtering
- **Complete drill & drill bit coverage**

### **Complete Raw Dataset**
```
📄 comprehensive_drilling_data_20250816_181154.json
```
- **20 total products** (8 drills + 12 drill bit sets)
- **Full structured data** with all specifications
- **Use this if you want to create your own chunking strategy**

## 🚀 **How to Export to Your RAG Project**

### **Option 1: Copy Files Directly**
```bash
# Copy the RAG-optimized chunks (recommended)
cp /Users/moe/Dev/handycan/data-getter/data/drilling_rag_chunks_20250816_181154.json /path/to/your/rag-project/

# Copy the complete dataset (if needed)
cp /Users/moe/Dev/handycan/data-getter/data/comprehensive_drilling_data_20250816_181154.json /path/to/your/rag-project/
```

### **Option 2: Load Programmatically**
```python
import json

# Load RAG chunks (recommended for vectorization)
with open('/Users/moe/Dev/handycan/data-getter/data/drilling_rag_chunks_20250816_181154.json', 'r') as f:
    rag_chunks = json.load(f)

# Each chunk has:
# - id: unique identifier
# - type: chunk type (drill_overview, specifications, etc.)
# - content: text content for embedding
# - metadata: filterable attributes

print(f"Loaded {len(rag_chunks)} chunks ready for vectorization")
```

### **Option 3: Use as Python Package**
```python
# You can import the data generation functions
import sys
sys.path.append('/Users/moe/Dev/handycan/data-getter')

from comprehensive_drill_data import generate_all_drill_types, generate_all_drill_bit_types

# Generate fresh data in your project
drills = generate_all_drill_types()
drill_bits = generate_all_drill_bit_types()
```

## 📊 **Data Structure for RAG Implementation**

### **RAG Chunk Format**
```json
{
  "id": "DCD771C2_main",
  "type": "drill_overview", 
  "content": "Drill: DEWALT 20V MAX Cordless Drill by DEWALT...",
  "metadata": {
    "product_id": "DCD771C2",
    "product_type": "drill",
    "drill_type": "cordless_drill_driver",
    "brand": "DEWALT",
    "price": 149.99
  }
}
```

### **Chunk Types Available**
- `drill_overview` - Product descriptions
- `drill_specifications` - Technical specs  
- `drilling_capacity` - Material capabilities
- `drill_applications` - Use cases
- `drill_bit_overview` - Bit set descriptions
- `drill_bit_specifications` - Bit specs
- `drill_bit_sizes` - Size ranges
- `drill_bit_materials` - Compatible materials
- `drill_bit_applications` - Applications

### **Metadata for Filtering**
- `product_type`: "drill" or "drill_bit"
- `brand`: DEWALT, Milwaukee, Makita, etc.
- `price`: Numeric price for range filtering
- `drill_type`/`bit_type`: Specific product categories

## 🔗 **Integration Examples**

### **For Pinecone**
```python
import pinecone
from sentence_transformers import SentenceTransformer

# Load your chunks
with open('drilling_rag_chunks_20250816_181154.json', 'r') as f:
    chunks = json.load(f)

# Create embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

for chunk in chunks:
    embedding = model.encode(chunk['content'])
    
    # Upsert to Pinecone
    pinecone.upsert(
        id=chunk['id'],
        values=embedding.tolist(),
        metadata=chunk['metadata']
    )
```

### **For Weaviate**
```python
import weaviate

client = weaviate.Client("http://localhost:8080")

for chunk in chunks:
    client.data_object.create(
        data_object={
            "content": chunk['content'],
            "type": chunk['type'],
            **chunk['metadata']
        },
        class_name="HardwareProduct"
    )
```

### **For ChromaDB**
```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("hardware_store")

collection.add(
    documents=[chunk['content'] for chunk in chunks],
    metadatas=[chunk['metadata'] for chunk in chunks],
    ids=[chunk['id'] for chunk in chunks]
)
```

## 📋 **File Locations**

All files are in: `/Users/moe/Dev/handycan/data-getter/data/`

**For RAG Projects (pick one):**
- `drilling_rag_chunks_20250816_181154.json` ← **RECOMMENDED**
- `comprehensive_drilling_data_20250816_181154.json` ← Raw data

**For Analysis:**
- `products_analysis_20250816_175556.csv` ← Spreadsheet format

## 🎯 **Quick Start for Your RAG Project**

1. **Copy the RAG chunks file** to your project
2. **Load the JSON** into your Python code
3. **Create embeddings** for each chunk's content
4. **Store in vector DB** with metadata for filtering
5. **Build semantic search** over the content

Your hardware store assistant is ready to answer questions about drills and drill bits! 🔧