from flask import Flask, request, jsonify
from llama_index.llms.ollama import Ollama
from llama_parse import LlamaParse
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, PromptTemplate
from llama_index.core.embeddings import resolve_embed_model
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core.agent import ReActAgent
from dotenv import load_dotenv
from prompt_extraction import extraction_prompt
from prompt_validation import validation_prompt
import os
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

load_dotenv()

llm = Ollama(
    model="mistral",
    request_timeout=60.0
)

parser = LlamaParse(result_type="markdown")
file_extractor = {".pdf": parser}

documents = SimpleDirectoryReader("./data", file_extractor=file_extractor).load_data()

embed_model = resolve_embed_model("local:BAAI/bge-m3")
vector_index = VectorStoreIndex.from_documents(documents, embed_model=embed_model)
query_engine = vector_index.as_query_engine(llm=llm)

extraction_tool = QueryEngineTool(
    query_engine=query_engine,
    metadata=ToolMetadata(
        name="relevant_keyword_extraction",
        description="From the uploaded term sheet, search for the relevant keywords and extract the data from the document"
    ),
)

validation_tool = QueryEngineTool(
    query_engine=query_engine,
    metadata=ToolMetadata(
        name="document_validation",
        description="This validates the data extracted from the document"
    ),
)

# Create ReAct agent for extraction
extract_agent = ReActAgent.from_tools([extraction_tool, validation_tool], llm=llm, verbose=True, context=extraction_prompt)

# API endpoint to extract data
@app.route('/extract', methods=['GET'])
def extract_data():
    try:
        query = ("Extract the following information from the term sheet text. Firstly print the Type of Term Sheet "
                 "and then for each section, find related content using the provided keywords. "
                 "If a section is not present, leave it empty. Format the result as JSON:\n\n")
        extraction_result = query_engine.query(query)
        return jsonify({"extracted_data": str(extraction_result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint to validate extracted data
@app.route('/validate', methods=['POST'])
def validate_data():
    try:
        data = request.json
        print(data)
        extracted_data = data.get("extracted_data", "")

        if not extracted_data:
            return jsonify({"error": "No extracted data provided."}), 400

        validation_engine = validation_tool.query_engine
        validation_input = validation_prompt + "\n\nHere is the extracted data:\n" + str(extracted_data)
        validation_result = validation_engine.query(validation_input)

        return jsonify({"validation_result": str(validation_result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)