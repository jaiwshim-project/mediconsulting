/**
 * Supabase REST API Helper
 */
var SUPABASE_URL = 'https://haxcktfnuudlqciyljtp.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGNrdGZudXVkbHFjaXlsanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDUwNDAsImV4cCI6MjA4NDg4MTA0MH0.suN7BeaHx3MjaNlMDQa0940P-rMl2XPyk4ksoQEU3YM';

function supabaseHeaders(prefer) {
    var h = {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
    };
    if (prefer) h['Prefer'] = prefer;
    return h;
}

// 진단 결과 저장
function supabaseInsertDiagnosis(data) {
    return fetch(SUPABASE_URL + '/rest/v1/diagnoses', {
        method: 'POST',
        headers: supabaseHeaders('return=representation'),
        body: JSON.stringify(data)
    }).then(function(res) { return res.json(); });
}

// 진단 결과 전체 조회
function supabaseFetchDiagnoses() {
    return fetch(SUPABASE_URL + '/rest/v1/diagnoses?order=id.asc', {
        headers: supabaseHeaders()
    }).then(function(res) { return res.json(); });
}

// 진단 결과 단건 조회 (id)
function supabaseFetchDiagnosisById(id) {
    return fetch(SUPABASE_URL + '/rest/v1/diagnoses?id=eq.' + id, {
        headers: supabaseHeaders()
    }).then(function(res) { return res.json(); })
      .then(function(arr) { return arr[0] || null; });
}

// 문의사항 저장
function supabaseInsertInquiry(data) {
    return fetch(SUPABASE_URL + '/rest/v1/inquiries', {
        method: 'POST',
        headers: supabaseHeaders('return=representation'),
        body: JSON.stringify(data)
    }).then(function(res) { return res.json(); });
}

// 문의사항 전체 조회
function supabaseFetchInquiries() {
    return fetch(SUPABASE_URL + '/rest/v1/inquiries?order=id.asc', {
        headers: supabaseHeaders()
    }).then(function(res) { return res.json(); });
}
