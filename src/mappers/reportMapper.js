export const reportMapper = {
  toUi(apiData) {
    if (!apiData) return null

    return {
      id: String(apiData.id || ''),
      orderNumber: apiData.order_number || '',
      patientId: apiData.patient_id || '',
      status: normalizeStatus(apiData.status),
      exam: apiData.exam || '',
      requestedBy: apiData.requested_by || '',
      cidCode: apiData.cid_code || '',
      diagnosis: apiData.diagnosis || '',
      conclusion: apiData.conclusion || '',
      contentHtml: apiData.content_html || '',
      contentJson: apiData.content_json ?? null,
      hideDate: Boolean(apiData.hide_date),
      hideSignature: Boolean(apiData.hide_signature),
      dueAt: apiData.due_at || '',
      createdBy: apiData.created_by || '',
      updatedBy: apiData.updated_by || '',
      createdAt: apiData.created_at || '',
      updatedAt: apiData.updated_at || '',
    }
  },

  toApi(uiData) {
    return cleanPayload({
      patient_id: uiData.patientId,
      status: normalizeApiStatus(uiData.status),
      exam: emptyToUndefined(uiData.exam),
      requested_by: emptyToUndefined(uiData.requestedBy),
      cid_code: emptyToUndefined(uiData.cidCode),
      diagnosis: emptyToUndefined(uiData.diagnosis),
      conclusion: emptyToUndefined(uiData.conclusion),
      content_html: emptyToUndefined(uiData.contentHtml),
      content_json: uiData.contentJson === undefined ? undefined : uiData.contentJson,
      hide_date: Boolean(uiData.hideDate),
      hide_signature: Boolean(uiData.hideSignature),
      due_at: emptyToUndefined(uiData.dueAt),
    })
  },
}

function normalizeStatus(status) {
  return status === 'draft' ? 'draft' : 'draft'
}

function normalizeApiStatus(status) {
  return status === 'draft' ? 'draft' : 'draft'
}

function emptyToUndefined(value) {
  return value === '' || value === null ? undefined : value
}

function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  )
}
