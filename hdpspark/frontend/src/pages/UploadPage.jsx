import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileSpreadsheet, Globe, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import useDashboardStore from '../store/useDashboardStore'

export default function UploadPage() {
  const { loading, error, dataset, confluenceResult, uploadJiraFile, parseConfluence, generateDashboard, clearError } = useDashboardStore()
  const [confluenceUrl, setConfluenceUrl] = useState('')
  const [confluenceText, setConfluenceText] = useState('')
  const [inputMode, setInputMode] = useState('url') // url | text

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
          Upload your Jira Excel export and optionally add Confluence content to generate
          comprehensive dashboards with KPIs, OKRs, and team analytics.
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
        {/* Jira Upload */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-spark-400" />
            <h3 className="text-lg font-semibold">Jira Excel Upload</h3>
            {dataset && <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />}
          </div>

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
