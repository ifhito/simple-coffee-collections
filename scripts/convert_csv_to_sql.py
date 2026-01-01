#!/usr/bin/env python3
"""
Convert CSV data to SQL INSERT statements for coffee_evaluations table.
"""
import csv
from pathlib import Path

def escape_sql_string(value):
    """Escape single quotes in SQL strings."""
    if value is None or value == '':
        return 'NULL'
    return f"'{str(value).replace(chr(39), chr(39) + chr(39))}'"

def read_shops(csv_path):
    """Read shops CSV and create a mapping of shop_id -> shop_name."""
    shops = {}
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            shops[row['id']] = row['name']
    return shops

def convert_bean_batches_to_sql(bean_batches_csv, shops_csv, output_sql):
    """Convert bean_batches CSV to coffee_evaluations INSERT statements."""

    # Read shops mapping
    shops = read_shops(shops_csv)

    # Start SQL file
    sql_lines = [
        "-- =============================================================================",
        "-- Import CSV data into coffee_evaluations table",
        "-- =============================================================================",
        "",
        "-- Insert coffee evaluation records from bean_batches CSV",
        "INSERT INTO coffee_evaluations (",
        "    id,",
        "    user_id,",
        "    shop_name,",
        "    bean_name,",
        "    bean_type,",
        "    roast_level,",
        "    acidity,",
        "    bitterness,",
        "    aroma,",
        "    overall_rating,",
        "    is_public,",
        "    created_at,",
        "    updated_at",
        ") VALUES"
    ]

    values = []

    with open(bean_batches_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Get shop name from purchase_shop_id or roaster_shop_id
            shop_id = row.get('purchase_shop_id') or row.get('roaster_shop_id')
            shop_name = shops.get(shop_id, 'Unknown Shop') if shop_id else 'Unknown Shop'

            # Map fields from bean_batches to coffee_evaluations
            id_val = escape_sql_string(row['id'])
            user_id = escape_sql_string(row['user_id'])
            shop_name_val = escape_sql_string(shop_name)
            bean_name = escape_sql_string(row['name'])  # name -> bean_name (product/blend name)
            bean_type = 'NULL'  # bean_type is optional (Arabica, Robusta, etc.)
            roast_level = escape_sql_string(row.get('roast_level') or None)

            # Map ratings (sourness -> acidity, keep aroma and bitterness)
            # Use liking as overall_rating
            # Handle empty values by defaulting to 5 (middle value)
            try:
                acidity = int(row.get('sourness') or 5)
                if acidity < 1 or acidity > 10:
                    acidity = 5
            except (ValueError, TypeError):
                acidity = 5

            try:
                bitterness = int(row.get('bitterness') or 5)
                if bitterness < 1 or bitterness > 10:
                    bitterness = 5
            except (ValueError, TypeError):
                bitterness = 5

            try:
                aroma = int(row.get('aroma') or 5)
                if aroma < 1 or aroma > 10:
                    aroma = 5
            except (ValueError, TypeError):
                aroma = 5

            try:
                overall_rating = int(row.get('liking') or 5)
                if overall_rating < 1 or overall_rating > 10:
                    overall_rating = 5
            except (ValueError, TypeError):
                overall_rating = 5

            # archived = true means it's private (not public)
            is_public = 'false' if row.get('archived') == 'true' else 'true'

            created_at = escape_sql_string(row.get('created_at'))
            updated_at = escape_sql_string(row.get('updated_at'))

            # Build VALUES clause
            value_str = f"""    (
        {id_val},
        {user_id},
        {shop_name_val},
        {bean_name},
        {bean_type},
        {roast_level},
        {acidity},
        {bitterness},
        {aroma},
        {overall_rating},
        {is_public},
        {created_at},
        {updated_at}
    )"""

            values.append(value_str)

    # Join all values with commas
    sql_lines.append(',\n'.join(values))
    sql_lines.append(";")
    sql_lines.append("")
    sql_lines.append("-- =============================================================================")
    sql_lines.append(f"-- Total records: {len(values)}")
    sql_lines.append("-- =============================================================================")

    # Write to output file
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))

    print(f"✓ Generated SQL file: {output_sql}")
    print(f"✓ Total records: {len(values)}")
    print(f"✓ Shops found: {len(shops)}")

if __name__ == '__main__':
    # File paths
    base_dir = Path(__file__).parent.parent
    bean_batches_csv = base_dir / 'bean_batches_rows.csv'
    shops_csv = base_dir / 'shops_rows.csv'
    output_sql = base_dir / 'supabase' / 'migrations' / '20260101000002_import_csv_data.sql'

    # Convert
    convert_bean_batches_to_sql(bean_batches_csv, shops_csv, output_sql)
