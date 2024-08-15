import re
import json
import PyPDF2
import pandas as pd

def scan_document(file_path):
    if file_path.endswith('.pdf'):
        return scan_pdf(file_path)
    elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        return scan_spreadsheet(file_path)
    elif file_path.endswith('.txt'):
        return scan_text(file_path)
    else:
        raise ValueError("Unsupported file type")

def scan_pdf(file_path):
    content = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfFileReader(file)
        for page_num in range(reader.numPages):
            page = reader.getPage(page_num)
            content += page.extract_text()
    return content

def scan_spreadsheet(file_path):
    df = pd.read_excel(file_path)
    return df.to_string()

def scan_text(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def detect_personal_info(content):
    patterns = {
        'names': r'\b[A-Z][a-z]* [A-Z][a-z]*\b',
        'addresses': r'\d{1,5} \w+ (Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd)\b',
        'phone_numbers': r'\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'dob': r'\b\d{2}/\d{2}/\d{4}\b',
        'credit_card': r'\b\d{4}[-.\s]??\d{4}[-.\s]??\d{4}[-.\s]??\d{4}\b'
    }
    detected_info = {}
    for key, pattern in patterns.items():
        matches = re.findall(pattern, content)
        if matches:
            detected_info[key] = matches
    return detected_info

def generate_report(detected_info, file_path):
    report = {
        'file_path': file_path,
        'detected_info': detected_info
    }
    report_path = file_path + '_report.json'
    with open(report_path, 'w') as report_file:
        json.dump(report, report_file, indent=4)
    print(f"Report generated: {report_path}")

def main(file_path):
    content = scan_document(file_path)
    detected_info = detect_personal_info(content)
    generate_report(detected_info, file_path)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python detect_personal_info.py <file_path>")
    else:
        main(sys.argv[1])