"""A reproducible mixed order: no repeats, no source/level blocks."""
import hashlib

def mixed(entries):
    return sorted(entries,key=lambda e:hashlib.sha256(('ifade-six-v1|'+e['id']).encode()).digest())
