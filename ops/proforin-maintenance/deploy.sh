#!/usr/bin/env bash
set -Eeuo pipefail

ARCHIVE_PATH="${1:-/root/proforin-maintenance-release.tar.gz}"
CANDIDATE_CONFIG="${2:-/root/proforin-maintenance-nginx.conf}"
EXPECTED_SHA256="${3:-}"

NGINX_CONFIG="/etc/nginx/sites-available/kliko-site"
MAINTENANCE_ROOT="/srv/kliko-maintenance"
CURRENT_LINK="${MAINTENANCE_ROOT}/current"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RELEASE_DIR="${MAINTENANCE_ROOT}/releases/${STAMP}"
BACKUP_DIR="/root/backups/proforin-maintenance/${STAMP}"
OLD_CURRENT=""
DEPLOYMENT_FINISHED=0

case "${RELEASE_DIR}" in
  /srv/kliko-maintenance/releases/*) ;;
  *) echo "Unsafe release path" >&2; exit 1 ;;
esac

for required_file in "${ARCHIVE_PATH}" "${CANDIDATE_CONFIG}" "${NGINX_CONFIG}"; do
  test -f "${required_file}" || {
    echo "Required file is missing: ${required_file}" >&2
    exit 1
  }
done

ACTUAL_SHA256="$(sha256sum "${ARCHIVE_PATH}" | awk '{print $1}')"
if [[ -n "${EXPECTED_SHA256}" && "${ACTUAL_SHA256}" != "${EXPECTED_SHA256}" ]]; then
  echo "Release archive checksum mismatch" >&2
  exit 1
fi

ARCHIVE_LIST="$(tar -tzf "${ARCHIVE_PATH}")"

if grep -Eq '(^/|(^|/)\.\.(/|$))' <<<"${ARCHIVE_LIST}"; then
  echo "Release archive contains an unsafe path" >&2
  exit 1
fi

for required_entry in index.html styles.css assets/background.png assets/kliko-logo.svg; do
  grep -Fxq "${required_entry}" <<<"${ARCHIVE_LIST}" || {
    echo "Release archive is missing ${required_entry}" >&2
    exit 1
  }
done

install -d -m 700 "${BACKUP_DIR}"
install -d -m 755 "${MAINTENANCE_ROOT}/releases"
install -d -m 755 "${RELEASE_DIR}"

cp -a "${NGINX_CONFIG}" "${BACKUP_DIR}/kliko-site.nginx.before"
cp -a "${CANDIDATE_CONFIG}" "${BACKUP_DIR}/kliko-site.nginx.candidate"
nginx -T >"${BACKUP_DIR}/nginx.before.txt" 2>&1
sha256sum "${ARCHIVE_PATH}" >"${BACKUP_DIR}/release.sha256"
printf '%s\n' "${ARCHIVE_LIST}" >"${BACKUP_DIR}/release-files.txt"
systemctl is-active kliko-site.service >"${BACKUP_DIR}/kliko-site.state.before" || true

if [[ -L "${CURRENT_LINK}" ]]; then
  OLD_CURRENT="$(readlink -f "${CURRENT_LINK}")"
  printf '%s\n' "${OLD_CURRENT}" >"${BACKUP_DIR}/maintenance-current.before"
elif [[ -e "${CURRENT_LINK}" ]]; then
  echo "${CURRENT_LINK} exists and is not a symlink" >&2
  exit 1
fi

rollback() {
  local status=$?
  if [[ ${status} -ne 0 && ${DEPLOYMENT_FINISHED} -eq 0 ]]; then
    echo "Deployment failed; restoring previous nginx configuration" >&2
    cp -a "${BACKUP_DIR}/kliko-site.nginx.before" "${NGINX_CONFIG}"
    if [[ -n "${OLD_CURRENT}" ]]; then
      ln -s "${OLD_CURRENT}" "${CURRENT_LINK}.rollback-${STAMP}"
      mv -Tf "${CURRENT_LINK}.rollback-${STAMP}" "${CURRENT_LINK}"
    else
      rm -f "${CURRENT_LINK}"
    fi
    nginx -t && systemctl reload nginx.service || true
  fi
  exit "${status}"
}
trap rollback EXIT

tar -xzf "${ARCHIVE_PATH}" --no-same-owner -C "${RELEASE_DIR}"
find "${RELEASE_DIR}" -type d -exec chmod 755 {} +
find "${RELEASE_DIR}" -type f -exec chmod 644 {} +
chown -R root:root "${RELEASE_DIR}"

ln -s "${RELEASE_DIR}" "${CURRENT_LINK}.new-${STAMP}"
mv -Tf "${CURRENT_LINK}.new-${STAMP}" "${CURRENT_LINK}"
install -o root -g root -m 644 "${CANDIDATE_CONFIG}" "${NGINX_CONFIG}"

nginx -t
systemctl reload nginx.service

PAGE_CONTENT=""
for attempt in {1..40}; do
  PAGE_CONTENT="$(curl --fail --silent --show-error --max-time 15 \
    --resolve proforin.online:8443:127.0.0.1 \
    https://proforin.online:8443/)" || true
  if grep -Fq 'Мы переезжаем!' <<<"${PAGE_CONTENT}"; then
    break
  fi
  sleep 0.25
done

grep -Fq 'Мы переезжаем!' <<<"${PAGE_CONTENT}"
grep -Fq 'https://kliko.su/' <<<"${PAGE_CONTENT}"
curl --fail --silent --show-error --max-time 15 \
  --resolve proforin.online:8443:127.0.0.1 \
  https://proforin.online:8443/assets/kliko-logo.svg >/dev/null

systemctl is-active --quiet nginx.service
systemctl is-active --quiet kliko-site.service
LISTENERS="$(ss -ltnp)"
grep -Eq ':443\b.*xray' <<<"${LISTENERS}"

printf 'release=%s\nbackup=%s\nsha256=%s\n' \
  "${RELEASE_DIR}" "${BACKUP_DIR}" "${ACTUAL_SHA256}" \
  >"${BACKUP_DIR}/deployment-result.txt"

DEPLOYMENT_FINISHED=1
trap - EXIT

echo "DEPLOYMENT_OK"
echo "release=${RELEASE_DIR}"
echo "backup=${BACKUP_DIR}"
echo "sha256=${ACTUAL_SHA256}"
