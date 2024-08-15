import subprocess

def retrieve_file(cid):
    try:
        # Use the ipfs cat command to retrieve the file
        result = subprocess.run(['ipfs', 'cat', cid], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode == 0:
            print("File Content:\n")
            print(result.stdout)
        else:
            print(f"Error retrieving file: {result.stderr}")
    except Exception as e:
        print(f"An error occurred: {e}")

def main():
    print("IPFS File Retrieval Script")
    
    # Ask for the CID of the file to retrieve
    cid = input("Enter the CID of the file to retrieve: ")
    
    if cid:
        retrieve_file(cid)
    else:
        print("No CID provided.")

if __name__ == "__main__":
    main()
