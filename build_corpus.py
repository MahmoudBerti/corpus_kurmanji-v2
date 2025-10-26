import json
import re
from pathlib import Path

INPUT_DIR = Path("data")
OUTPUT_FILE = Path("data/processed.json")


def tokenize(text):
    """Découpe le texte en tokens simples"""
    return re.findall(r"\b[\w']+\b", text.lower())


def build_corpus():
    corpus = []

    # Mapping dossiers → clés de genre (ENGLISH, sans accents/espaces)
    FOLDER_MAPPING = {
        'poetry': 'helbest',
        'novels': 'roman',
        'theatre': 'sano',              # anciennement "şano"
        'newspaper': 'rojname',
        'site-web': 'malper',
        'specifique-corpus': 'corpus_specifique',
        'traditional-songs': 'dengbej',
        'dictionary': 'ferheng'
    }

    print("📦 Building corpus...")
    print("📂 Checking folders:")

    # Vérifier d'abord quels dossiers existent
    existing_folders = []
    for folder_name in FOLDER_MAPPING.keys():
        folder_path = INPUT_DIR / folder_name
        if folder_path.exists():
            existing_folders.append(folder_name)
            print(f"   ✅ {folder_name}")
        else:
            print(f"   ❌ {folder_name} (missing)")

    # Parcourir tous les sous-dossiers de data
    for genre_dir in INPUT_DIR.iterdir():
        if genre_dir.is_dir():
            folder_name = genre_dir.name
            genre_key = FOLDER_MAPPING.get(folder_name, 'unknown')

            print(f"\n📁 Processing folder: {folder_name} -> {genre_key}")

            txt_files = list(genre_dir.glob("*.txt"))
            print(f"   📄 Files found: {len(txt_files)}")

            for file in txt_files:
                try:
                    text = file.read_text(encoding="utf-8")
                    tokens = tokenize(text)
                    corpus.append({
                        "filename": file.name,
                        "folder": folder_name,
                        "tokens": tokens,
                        "text": text,
                        "genre": genre_key
                    })
                    print(f"   ✅ {file.name} ({len(text)} chars, {len(tokens)} words)")
                except Exception as e:
                    print(f"   ❌ Error reading {file}: {e}")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(corpus, ensure_ascii=False, indent=2), encoding="utf-8")

    # Statistiques détaillées
    print(f"\n📊 Final stats:")
    print(f"   📄 Total documents: {len(corpus)}")

    # Compter par genre
    genre_stats = {}
    for doc in corpus:
        genre = doc["genre"]
        genre_stats[genre] = genre_stats.get(genre, 0) + 1

    for genre, count in genre_stats.items():
        print(f"   🏷️  {genre}: {count} documents")

    print(f"\n✅ Corpus successfully built: {OUTPUT_FILE}")


def get_genre_from_folder(folder_name):
    """Map folder names to genre keys"""
    folder_mapping = {
        'poetry': 'helbest',
        'novels': 'roman',
        'theatre': 'sano',
        'newspaper': 'rojname',
        'site-web': 'malper',
        'specifique-corpus': 'corpus_specifique',
        'traditional-songs': 'dengbej',
        'dictionary': 'ferheng'
    }
    return folder_mapping.get(folder_name, 'unknown')


if __name__ == "__main__":
    build_corpus()
