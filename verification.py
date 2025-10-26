# verification.py
import json
from collections import Counter


def verify_corpus():
    with open("data/processed.json", "r", encoding="utf-8") as f:
        corpus = json.load(f)

    print("🔍 Vérification du corpus:")
    print(f"Total documents: {len(corpus)}")

    # Compter par genre
    genres = Counter(doc["genre"] for doc in corpus)
    print("\n📊 Par genre:")
    for genre, count in genres.items():
        print(f"  {genre}: {count}")

    # Compter par dossier
    folders = Counter(doc["folder"] for doc in corpus)
    print("\n📁 Par dossier:")
    for folder, count in folders.items():
        print(f"  {folder}: {count}")


if __name__ == "__main__":
    verify_corpus()