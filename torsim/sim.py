import random
import string

class Node:
    def __init__(self, name):
        self.name = name
        self.key = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))

    def encrypt(self, message):
        return ''.join(chr(ord(char) ^ ord(self.key[i % len(self.key)])) for i, char in enumerate(message))

    def decrypt(self, message):
        return self.encrypt(message)  # XORing twice with the same key returns the original message

class OnionRouter:
    def __init__(self, nodes):
        self.nodes = nodes

    def route_message(self, message):
        print(f"Original message: {message}")
        encrypted_message = message
        for node in self.nodes:
            encrypted_message = node.encrypt(encrypted_message)
            print(f"Encrypted by {node.name}: {encrypted_message}")

        decrypted_message = encrypted_message
        for node in reversed(self.nodes):
            decrypted_message = node.decrypt(decrypted_message)
            print(f"Decrypted by {node.name}: {decrypted_message}")

        print(f"Final decrypted message: {decrypted_message}")

# Create nodes
nodes = [Node(f"Node{i}") for i in range(3)]

# Create an OnionRouter with the nodes
router = OnionRouter(nodes)

# Route a message through the OnionRouter
router.route_message("Hello, Tor!")