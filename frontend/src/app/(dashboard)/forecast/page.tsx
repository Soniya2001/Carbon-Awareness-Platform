'use client';

import { useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ForecastAreaChart } from '@/src/components/charts/ForecastAreaChart';
import { useForecast } from '@/src/hooks/useForecast';
import { formatCO2 } from '@/src/lib/utils';

export default function ForecastPage() {
  const { monthly, quarterly, annual, fetchAll, isLoading } = useForecast();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // monthly is a single ForecastResult from the hook; quarterly is ForecastResult[]
  const areaData = quarterly?.map((f, i) => ({
    period: f.period || `Month ${i + 1}`,
    predicted: f.predictedCo2e,
    lower: f.predictedCo2e * (1 - (1 - f.confidence) * 0.5),
    upper: f.predictedCo2e * (1 + (1 - f.confidence) * 0.5),
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-eco-600" aria-hidden="true" />
          Forecast
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered predictions based on your historical activity
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800" role="note">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p>Forecasts are estimates based on your logged data. More data = higher accuracy.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">Next Month</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {monthly ? formatCO2(monthly.predictedCo2e) : '—'}
                </p>
                {monthly && (
                  <Badge variant="outline" className="mt-2 text-xs border-eco-300 text-eco-700">
                    {Math.round(monthly.confidence * 100)}% confidence
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">Next Quarter</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {quarterly ? formatCO2(quarterly.predictedCo2e) : '—'}
                </p>
                {quarterly && (
                  <Badge variant="outline" className="mt-2 text-xs border-blue-300 text-blue-700">
                    {Math.round(quarterly.confidence * 100)}% confidence
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">Annual Forecast</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {annual ? formatCO2(annual.predictedCo2e) : '—'}
                </p>
                {annual && (
                  <div className="mt-2 flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={
                        annual.trend === 'decreasing'
                          ? 'text-eco-700 border-eco-300 text-xs'
                          : annual.trend === 'increasing'
                          ? 'text-red-700 border-red-300 text-xs'
                          : 'text-yellow-700 border-yellow-300 text-xs'
                      }
                    >
                      {annual.trend === 'decreasing' ? '↓ Improving' : annual.trend === 'increasing' ? '↑ Rising' : '→ Stable'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Forecast</CardTitle>
          <CardDescription>Shaded area shows confidence interval</CardDescription>
        </CardHeader>
        <CardContent>
          <ForecastAreaChart data={areaData} isLoading={isLoading} height={300} />
        </CardContent>
      </Card>

      {/* Quarterly table */}
      {quarterly && quarterly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Month-by-Month Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Monthly forecast table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">Period</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Predicted CO₂e</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Confidence</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quarterly.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-900">{f.period}</td>
                      <td className="py-2.5 text-right">{formatCO2(f.predictedCo2e)}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-full bg-eco-500 rounded-full"
                              style={{ width: `${f.confidence * 100}%` }}
                            />
                          </div>
                          <span>{Math.round(f.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className={
                            f.trend === 'decreasing'
                              ? 'text-eco-700 border-eco-300 text-xs'
                              : f.trend === 'increasing'
                              ? 'text-red-700 border-red-300 text-xs'
                              : 'text-yellow-700 border-yellow-300 text-xs'
                          }
                        >
                          {f.trend}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
