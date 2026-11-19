"""Validate UC06 fixtures against the F02 order-intake contract without backend I/O."""

import argparse
import copy
import csv
import hashlib
import io
import json
import re
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from tempfile import TemporaryDirectory
from zoneinfo import ZoneInfo


REQUIRED = (
    'order_code', 'recipient_name', 'recipient_phone', 'delivery_address',
    'window_start', 'window_end', 'weight_kg',
)
OPTIONAL = ('priority', 'note', 'latitude', 'longitude')
HEADERS = list(REQUIRED + OPTIONAL)
TIMEZONE = ZoneInfo('Asia/Ho_Chi_Minh')
DATE_FORMAT = '%Y-%m-%d %H:%M'
DATE_PATTERN = re.compile(r'[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}')
ORDER_CODE_PATTERN = re.compile(r'[A-Za-z0-9_-]{1,40}')


def validate_file(path, existing_codes=()):
    errors = []
    normalized = []

    def error(row, field, code, reason, value=None):
        item = {'row': row, 'field': field, 'code': code, 'reason': reason}
        if value is not None:
            item['value'] = value
        errors.append(item)

    raw = path.read_bytes()
    if path.suffix.lower() != '.csv':
        error(None, 'file', 'FILE_TYPE', 'Use a .csv file.')
    if len(raw) > 1_000_000:
        error(None, 'file', 'FILE_SIZE', 'File exceeds 1,000,000 bytes.')
    try:
        decoded = raw.decode('utf-8-sig')
        records = list(csv.reader(io.StringIO(decoded, newline=''), strict=True))
    except (UnicodeDecodeError, csv.Error) as exc:
        error(None, 'file', 'FILE_FORMAT', type(exc).__name__)
        return {'path': path.name, 'dataRows': 0, 'errors': errors, 'rows': []}
    if not records:
        error(None, 'file', 'EMPTY_FILE', 'File has no header or data.')
        return {'path': path.name, 'dataRows': 0, 'errors': errors, 'rows': []}
    header, *data = records
    if not data:
        error(None, 'file', 'NO_DATA_ROWS', 'Add at least one data row.')
    if len(data) > 500:
        error(None, 'file', 'ROW_LIMIT', 'File exceeds 500 data rows.')
    for name in REQUIRED:
        if name not in header:
            error(1, name, 'MISSING_HEADER', 'Required header is missing.')
    for name in set(header):
        if name not in HEADERS:
            error(1, name, 'UNKNOWN_HEADER', 'Header is outside the F02 field contract.')
        if header.count(name) > 1:
            error(1, name, 'DUPLICATE_HEADER', 'Header appears more than once.')
    if errors:
        return {'path': path.name, 'dataRows': len(data), 'errors': errors, 'rows': []}

    code_rows = defaultdict(list)
    existing = {code.strip().lower() for code in existing_codes}
    for row_number, values in enumerate(data, start=2):
        if len(values) != len(header):
            error(row_number, 'row', 'COLUMN_COUNT', 'Row length differs from header.')
            continue
        original = dict(zip(header, values))
        row = {key: value.strip() for key, value in original.items()}
        missing = {field for field in REQUIRED if not row[field]}
        for field in REQUIRED:
            if field in missing:
                error(row_number, field, 'REQUIRED', 'Required value is blank.', original[field])

        code = row['order_code']
        if ORDER_CODE_PATTERN.fullmatch(code):
            normalized_code = code.lower()
            code_rows[normalized_code].append((row_number, original['order_code']))
            if normalized_code in existing:
                error(row_number, 'order_code', 'DUPLICATE_EXISTING', 'Code already exists in the synthetic current-hub store.', original['order_code'])
        elif code:
            error(row_number, 'order_code', 'ORDER_CODE_FORMAT', 'Use 1–40 ASCII letters, digits, underscores or hyphens.', original['order_code'])
        if row['recipient_name'] and len(row['recipient_name']) > 100:
            error(row_number, 'recipient_name', 'NAME_LENGTH', 'Name exceeds 100 characters.', original['recipient_name'])
        if row['recipient_phone'] and not re.fullmatch(r'0[0-9]{9}', row['recipient_phone']):
            error(row_number, 'recipient_phone', 'PHONE_FORMAT', 'Use exactly 10 digits starting with 0.', original['recipient_phone'])
        address = row['delivery_address']
        if address and not 5 <= len(address) <= 255:
            error(row_number, 'delivery_address', 'ADDRESS_LENGTH', 'Address must contain 5–255 characters.', original['delivery_address'])

        times = {}
        for field in ('window_start', 'window_end'):
            if field in missing:
                continue
            try:
                if not DATE_PATTERN.fullmatch(row[field]):
                    raise ValueError('Wrong format')
                times[field] = datetime.strptime(row[field], DATE_FORMAT).replace(tzinfo=TIMEZONE)
            except ValueError:
                error(row_number, field, 'DATE_TIME_FORMAT', 'Use a valid YYYY-MM-DD HH:mm date-time.', original[field])
        if len(times) == 2 and times['window_end'] <= times['window_start']:
            error(row_number, 'window_end', 'WINDOW_ORDER', 'Window end must be strictly later than start.', original['window_end'])
        if 'weight_kg' not in missing:
            try:
                weight = Decimal(row['weight_kg'])
                if not weight.is_finite() or weight <= 0:
                    raise InvalidOperation
            except InvalidOperation:
                error(row_number, 'weight_kg', 'WEIGHT_POSITIVE', 'Weight must be a finite number greater than zero.', original['weight_kg'])

        priority = row.get('priority', '')
        if priority and priority not in ('NORMAL', 'HIGH'):
            error(row_number, 'priority', 'PRIORITY_VALUE', 'Priority must be NORMAL or HIGH.', original['priority'])
        lat, lon = row.get('latitude', ''), row.get('longitude', '')
        if bool(lat) != bool(lon):
            error(row_number, 'latitude/longitude', 'COORDINATE_PAIR', 'Supply both coordinates or neither.')
        for field, value, limit in (('latitude', lat, 90), ('longitude', lon, 180)):
            if not value:
                continue
            try:
                coordinate = Decimal(value)
                if not coordinate.is_finite() or not -limit <= coordinate <= limit:
                    raise InvalidOperation
            except InvalidOperation:
                error(row_number, field, 'COORDINATE_RANGE', 'Coordinate is nonfinite or outside its allowed range.', value)
        normalized.append(row)

    for occurrences in code_rows.values():
        if len(occurrences) > 1:
            rows = [number for number, _ in occurrences]
            for number, value in occurrences:
                error(number, 'order_code', 'DUPLICATE_IN_FILE', 'Normalized code is duplicated on CSV rows ' + ', '.join(map(str, rows)) + '.', value)
    errors.sort(key=lambda item: (item['row'] or 0, item['field'], item['code']))
    return {'path': path.name, 'dataRows': len(data), 'errors': errors, 'rows': normalized}


def demonstrate_atomic_import(path, store):
    """Model all-or-nothing publication in memory; not a database transaction test."""
    before = copy.deepcopy(store)
    result = validate_file(path, store.keys())
    if result['errors']:
        inserted = 0
    else:
        staged = copy.deepcopy(store)
        for row in result['rows']:
            staged[row['order_code'].lower()] = copy.deepcopy(row)
        store.clear()
        store.update(staged)
        inserted = len(result['rows'])
    return {
        'mode': 'in_memory_demonstration_only',
        'inserted': inserted,
        'rejected': result['dataRows'] if result['errors'] else 0,
        'storeUnchanged': store == before,
        'existingRecordPreserved': store.get('existing-demo-001') == before.get('existing-demo-001'),
        'validControlInserted': 'csv-valid-control' in store,
        'storeCountBefore': len(before), 'storeCountAfter': len(store),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, help='Optional JSON result path; default prints only.')
    args = parser.parse_args()
    base = Path(__file__).resolve().parent
    checks = {}
    for filename, expected_rows in (('valid-orders.csv', 5), ('invalid-orders.csv', 8)):
        path = base / filename
        header = next(csv.reader(io.StringIO(path.read_text(encoding='utf-8-sig'))))
        assert header == HEADERS, (filename, 'Fixture header differs from exact shared header')
        result = validate_file(path)
        assert result['dataRows'] == expected_rows, (filename, result)
        checks[filename] = {
            key: value for key, value in result.items() if key != 'rows'
        }
        checks[filename]['bytes'] = path.stat().st_size
        checks[filename]['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
        checks[filename]['rowsWithErrors'] = sorted({error['row'] for error in result['errors'] if error['row'] is not None})
        checks[filename]['individuallyValidRows'] = expected_rows - len(checks[filename]['rowsWithErrors'])

    assert not checks['valid-orders.csv']['errors'], checks['valid-orders.csv']
    expected = {
        (2, 'recipient_phone', 'PHONE_FORMAT'), (3, 'weight_kg', 'WEIGHT_POSITIVE'),
        (4, 'weight_kg', 'WEIGHT_POSITIVE'), (5, 'window_end', 'WINDOW_ORDER'),
        (6, 'recipient_name', 'REQUIRED'), (7, 'order_code', 'DUPLICATE_IN_FILE'),
        (8, 'order_code', 'DUPLICATE_IN_FILE'),
    }
    actual = {(e['row'], e['field'], e['code']) for e in checks['invalid-orders.csv']['errors']}
    assert actual == expected, (actual, expected)
    assert checks['invalid-orders.csv']['individuallyValidRows'] == 1
    initial = {'existing-demo-001': {'fixture': 'Synthetic existing record'}}
    valid_store, invalid_store = copy.deepcopy(initial), copy.deepcopy(initial)
    valid_atomic = demonstrate_atomic_import(base / 'valid-orders.csv', valid_store)
    invalid_atomic = demonstrate_atomic_import(base / 'invalid-orders.csv', invalid_store)
    assert valid_atomic['inserted'] == 5 and valid_atomic['storeCountAfter'] == 6
    assert valid_atomic['existingRecordPreserved']
    assert invalid_atomic['inserted'] == 0 and invalid_atomic['rejected'] == 8
    assert invalid_store == initial and not invalid_atomic['validControlInserted']

    with (base / 'valid-orders.csv').open(encoding='utf-8-sig', newline='') as fixture:
        reader = csv.reader(fixture)
        header, row = next(reader), next(reader)
    regressions = {}
    with TemporaryDirectory() as directory:
        cases = (
            ('unicode-order-code', header, ['ĐH-01', *row[1:]], (2, 'order_code', 'ORDER_CODE_FORMAT')),
            ('unknown-header', [*header, 'extra'], [*row, 'ignored'], (1, 'extra', 'UNKNOWN_HEADER')),
        )
        for name, fields, values, expected_error in cases:
            path = Path(directory) / f'{name}.csv'
            with path.open('w', encoding='utf-8', newline='') as stream:
                csv.writer(stream).writerows((fields, values))
            errors = validate_file(path)['errors']
            assert [(e['row'], e['field'], e['code']) for e in errors] == [expected_error], errors
            store = copy.deepcopy(initial)
            result = demonstrate_atomic_import(path, store)
            assert result['inserted'] == 0 and result['rejected'] == 1 and store == initial, result
            regressions[name] = {'error': errors[0], 'atomicDemonstration': result}

    report = {
        'basis': 'D-F02-1 through D-F02-4 in the local BOOYAH-13 OpenSpec handoff',
        'headers': HEADERS, 'encoding': 'UTF-8 without BOM', 'dateTimeFormat': 'YYYY-MM-DD HH:mm',
        'timezone': 'Asia/Ho_Chi_Minh', 'rowNumbering': 'CSV record number; header is row 1',
        'scope': 'Synthetic single-hub store; no real database, authorization or commit-time race tested',
        'files': checks, 'atomicDemonstrations': {'valid': valid_atomic, 'invalid': invalid_atomic},
        'regressionChecks': regressions,
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.report:
        args.report.write_text(rendered, encoding='utf-8')
    print(rendered, end='')


if __name__ == '__main__':
    main()
