#!/usr/bin/env bash

set -euo pipefail

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-root}"
DB_NAME="${DB_NAME:-ez_tro_dev}"
OUTPUT_FILE="${OUTPUT_FILE:-src/main/resources/seeds/rbac-seed.json}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

mkdir -p "$(dirname "${PROJECT_DIR}/${OUTPUT_FILE}")"

roles_file="$(mktemp)"
permissions_file="$(mktemp)"
role_permissions_file="$(mktemp)"

cleanup() {
  rm -f "${roles_file}" "${permissions_file}" "${role_permissions_file}"
}

trap cleanup EXIT

mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" \
  --batch --raw --skip-column-names -D "${DB_NAME}" \
  -e "SELECT id, name, COALESCE(description,''), COALESCE(api_endpoint,''), http_method, COALESCE(resource_pattern,'') FROM permissions ORDER BY id" \
  > "${permissions_file}"

mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" \
  --batch --raw --skip-column-names -D "${DB_NAME}" \
  -e "SELECT id, name, COALESCE(description,'') FROM roles ORDER BY id" \
  > "${roles_file}"

mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" \
  --batch --raw --skip-column-names -D "${DB_NAME}" \
  -e "SELECT r.name, p.id, p.name, COALESCE(p.api_endpoint,''), p.http_method, COALESCE(p.resource_pattern,'') FROM roles r JOIN role_permissions rp ON rp.role_id = r.id JOIN permissions p ON p.id = rp.permission_id ORDER BY r.name, p.id" \
  > "${role_permissions_file}"

ruby -rjson -e '
permissions = []
canonical_keys = {}

File.foreach(ARGV[0], chomp: true) do |line|
  id, name, description, api_endpoint, http_method, resource_pattern = line.split("\t", -1)
  signature = [name, api_endpoint, http_method, resource_pattern]
  next if canonical_keys.key?(signature)

  key = "perm_#{id}"
  canonical_keys[signature] = key
  permissions << {
    key: key,
    name: name,
    description: description.empty? ? nil : description,
    apiEndpoint: api_endpoint.empty? ? nil : api_endpoint,
    httpMethod: http_method,
    resourcePattern: resource_pattern.empty? ? nil : resource_pattern
  }
end

roles = File.foreach(ARGV[1], chomp: true).map do |line|
  _id, name, description = line.split("\t", -1)
  {
    name: name,
    description: description.empty? ? nil : description
  }
end

role_permissions = {}
File.foreach(ARGV[2], chomp: true) do |line|
  role_name, _permission_id, name, api_endpoint, http_method, resource_pattern = line.split("\t", -1)
  signature = [name, api_endpoint, http_method, resource_pattern]
  permission_key = canonical_keys[signature]
  next unless permission_key

  role_permissions[role_name] ||= []
  role_permissions[role_name] << permission_key unless role_permissions[role_name].include?(permission_key)
end

payload = {
  roles: roles,
  permissions: permissions,
  rolePermissions: role_permissions.keys.sort.map do |role_name|
    {
      roleName: role_name,
      permissionKeys: role_permissions[role_name]
    }
  end
}

File.write(ARGV[3], JSON.pretty_generate(payload) + "\n")
' "${permissions_file}" "${roles_file}" "${role_permissions_file}" "${PROJECT_DIR}/${OUTPUT_FILE}"

echo "Exported RBAC seed to ${PROJECT_DIR}/${OUTPUT_FILE}"
