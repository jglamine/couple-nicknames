import json

def main():
    with open('../data/female_names_with_syllables.csv', 'r') as input_file:
        names = input_file.readlines()
    names_dict = {}
    for name_with_syllables in names:
        name_with_syllables = name_with_syllables.strip()
        syllables = name_with_syllables.split('-')
        name = ''.join(syllables)
        names_dict[name.lower()] = {
            'name': name,
            'syllables': syllables
        }
    with open('../data/female_names.json', 'w') as output_file:
        output_file.write(json.dumps(names_dict, sort_keys=True, indent=4, separators=(',', ': ')))

if __name__ == '__main__':
    main()
