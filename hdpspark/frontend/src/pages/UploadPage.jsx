import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileSpreadsheet, Globe, Sparkles, AlertCircle, CheckCircle2, Cloud, Key, Search } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import useDashboardStore from '../store/useDashboardStore'

export default function UploadPage() {
  const { loading, error, dataset, confluenceResult, uploadJiraFile, connectJira, listJiraProjects, parseConfluence, generateDashboard, clearError } = useDashboardStore()
  const [confluenceUrl, setConfluenceUrl] = useState('')
  const [confluenceText, setConfluenceText] = useState('')
  const [inputMode, setInputMode] = useState('url') // url | text
  const [jiraSource, setJiraSource] = useState('api') // api | excel

  // Jira API connect state
  const [siteUrl, setSiteUrl] = useState('')
  const [email, setEmail] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [jql, setJql] = useState('')
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    onDrop: async (files) => {
      if (files[0]) {
        clearError()
        await uploadJiraFile(files[0])
      }
    },
  })

  const handleFetchProjects = async () => {
    if (!siteUrl || !email || !apiToken) return
    setLoadingProjects(true)
    clearError()
    const result = await listJiraProjects({ site_url: siteUrl, email, api_token: apiToken })
    setProjects(result || [])
    setLoadingProjects(false)
  }

  const handleJiraConnect = async () => {
    clearError()
    await connectJira({
      site_url: siteUrl,
      email,
      api_token: apiToken,
      project_key: projectKey,
      jql,
    })
  }

  const handleConfluenceParse = async () => {
    clearError()
    const payload = inputMode === 'url'
      ? { url: confluenceUrl }
      : { raw_text: confluenceText }
    await parseConfluence(payload)
  }

  const handleGenerate = async () => {
    clearError()
    await generateDashboard()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spark-600/10 border border-spark-600/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-spark-400" />
          <span className="text-sm text-spark-300">On-demand analytics from your project data</span>
        </motion.div>
        <h2 className="text-4xl font-bold mb-3">
          Transform Your{' '}
          <span className="bg-gradient-to-r from-spark-400 to-purple-400 bg-clip-text text-transparent">
            Project Data
          </span>{' '}
          Into Insights
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Connect to Jira directly or upload an Excel export, then optionally add Confluence content
          for comprehensive dashboards with KPIs, OKRs, and team analytics.
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="grid gap-6">
        {/* Jira Data Source */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-spark-400" />
            <h3 className="text-lg font-semibold">Jira Data</h3>
            {dataset && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
          </div>

          {/* Source toggle */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setJiraSource('api')}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                jiraSource === 'api' ? 'bg-spark-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Connect to Jira
            </button>
            <button
              onClick={() => setJiraSource('excel')}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                jiraSource === 'excel' ? 'bg-spark-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Excel
            </button>
          </div>

          {jiraSource === 'api' ? (
            /* Jira API Connect */
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  <Key className="w-3 h-3 inline mr-1" />
                  No admin access needed. Generate a personal API token at{' '}
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
                    id.atlassian.com
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="yourcompany.atlassian.net"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-spark-500 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-spark-500 transition-colors"
                />
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="API Token"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-spark-500 transition-colors"
                />
              </div>

              {/* Project picker */}
              <div className="flex gap-2">
                <button
                  onClick={handleFetchProjects}
                  disabled={!siteUrl || !email || !apiToken || loadingProjects}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {loadingProjects ? 'Loading...' : 'Find Projects'}
                </button>
                {projects.length > 0 && (
                  <select
                    value={projectKey}
                    onChange={(e) => setProjectKey(e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-spark-500"
                  >
                    <option value="">All projects</option>
                    {projects.map((p) => (
                      <option key={p.key} value={p.key}>{p.key} - {p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Optional JQL */}
              <input
                type="text"
                value={jql}
                onChange={(e) => setJql(e.target.value)}
                placeholder="Custom JQL (optional) e.g. sprint in openSprints()"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-spark-500 transition-colors"
              />

              <button
                onClick={handleJiraConnect}
                disabled={loading || !siteUrl || !email || !apiToken}
                className="w-full py-2.5 text-sm font-medium bg-spark-600 hover:bg-spark-500 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Fetching Issues...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Connect & Fetch Issues
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Excel Upload */
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-spark-400 bg-spark-400/5' : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                {isDragActive ? (
                  <p className="text-spark-300">Drop your Excel file here...</p>
                ) : (
                  <>
                    <p className="text-gray-300 mb-1">Drag & drop your Jira Excel export here</p>
                    <p className="text-gray-500 text-sm">or click to browse (.xlsx files)</p>
                  </>
                )}
              </div>
            </>
          )}

          {dataset && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-spark-400">{dataset.total_issues}</div>
                <div className="text-xs text-gray-400">Issues Found</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{dataset.detected_sprints?.length || 0}</div>
                <div className="text-xs text-gray-400">Sprints</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{dataset.detected_epics?.length || 0}</div>
                <div className="text-xs text-gray-400">Epics</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Confluence Input */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Confluence Content</h3>
            <span className="text-xs text-gray-500">(Optional)</span>
            {confluenceResult && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode('url')}
              className={`px-3 py-1.5 text-sm rounded-lg ${inputMode === 'url' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Page URL
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 text-sm rounded-lg ${inputMode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              Paste Text
            </button>
          </div>

          {inputMode === 'url' ? (
            <input
              type="url"
              value={confluenceUrl}
              onChange={(e) => setConfluenceUrl(e.target.value)}
              placeholder="https://your-company.atlassian.net/wiki/spaces/..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-spark-500 transition-colors"
            />
          ) : (
            <textarea
              value={confluenceText}
              onChange={(e) => setConfluenceText(e.target.value)}
              placeholder="Paste your Confluence page content, OKRs, or project goals here..."
              rows={6}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-spark-500 transition-colors resize-y"
            />
          )}

          <button
            onClick={handleConfluenceParse}
            disabled={loading || (!confluenceUrl && !confluenceText)}
            className="mt-3 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-lg transition-colors"
          >
            Parse Content
          </button>

          {confluenceResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300">
                Extracted {confluenceResult.text_length} chars | Found <strong>{confluenceResult.okrs_found}</strong> OKRs
              </p>
            </motion.div>
          )}
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerate}
          disabled={!dataset || loading}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-spark-600 to-purple-600 hover:from-spark-500 hover:to-purple-500 disabled:opacity-40 transition-all shadow-lg shadow-spark-600/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Generating Dashboard...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Dashboard
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
