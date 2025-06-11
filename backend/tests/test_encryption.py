# tests/test_encryption.py

from app.encryption import encryptText, decryptSignal

def test_encrypt_decrypt_roundtrip():
    original = "Hello, świat!"
    encrypted = encryptText(original)
    assert isinstance(encrypted, list)
    decrypted = decryptSignal(encrypted)
    assert decrypted == original