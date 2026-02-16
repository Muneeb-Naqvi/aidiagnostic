{report.analysis && (
  <Card className="mt-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">AI Analysis Results</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      {report.analysis.diseases?.length > 0 ? (
        report.analysis.diseases.map((d, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded border">
            <p className="font-bold text-lg">{d.disease}</p>
            <p className="text-gray-600">
              Confidence: <span className="font-medium">{Math.round(d.confidence * 100)}%</span> • 
              Severity: <span className={`font-medium ${d.severity === 'severe' || d.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                {d.severity}
              </span>
            </p>
            <p className="mt-2">{d.details}</p>
            {d.riskFactors?.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Risk Factors:</p>
                <ul className="list-disc pl-5 text-gray-700">
                  {d.riskFactors.map((f, idx) => <li key={idx}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-green-600 font-medium">All parameters appear normal/healthy.</p>
      )}

      {report.analysis.suggestedSpecializations?.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold text-lg mb-2">Recommended Specialists:</p>
          <div className="flex flex-wrap gap-2">
            {report.analysis.suggestedSpecializations.map((spec, i) => (
              <Badge key={i} className="text-base py-1.5 px-3 bg-blue-50 text-blue-700 border-blue-200">
                {spec}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            Disclaimer: This is AI-generated suggestion. Please consult a qualified doctor.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
)}