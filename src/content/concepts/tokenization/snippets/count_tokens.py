# pip install tiktoken
import tiktoken

enc = tiktoken.get_encoding("o200k_base")  # vocabulario de GPT-4o y posteriores

text = "La tokenización no es trivial"
ids = enc.encode(text)
print(len(ids), ids)                     # 6 [4579, 6602, 18856, 860, 878, 86130]
print([enc.decode([i]) for i in ids])    # ['La', ' token', 'ización', ' no', ' es', ' trivial']

# El espacio y las mayúsculas cambian el token
for s in ["hola", " hola", "Hola", "HOLA"]:
    print(repr(s), enc.encode(s))        # 'HOLA' necesita dos tokens
