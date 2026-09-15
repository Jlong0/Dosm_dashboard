"""Offline export from the notebook's saved workbook and persisted outputs."""
from pathlib import Path
import hashlib
import io
import json
import re
import shutil
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RENAME = {
 'State':'state', 'Year':'year', 'Domestic_Visitors_TSA_000':'visitors000',
 "Population_('000)":'population000', 'Total Receipts (RM million)':'receiptsRmMil',
 'Avg Length of Stay (nights)':'avgStayNights', 'Visitors per Resident':'visitorsPerResident',
 'Tourism Receipts per Resident (RM)':'receiptsPerResidentRm',
 'Coastal Good+Excellent (%)':'coastalGoodExcellentPct', 'Coastal Poor (%)':'coastalPoorPct',
 'Mangrove Area (ha)':'mangroveHa', 'Municipal Waste Facility Tonnes/Day':'wasteTonnesPerDay',
 'Unemployment Rate (%)':'unemploymentPct', 'Labour Force Participation Rate (%)':'lfprPct',
 'CPI Food Away From Home':'cpiFoodAway', 'CPI Accommodation Services':'cpiAccom'}

def export_frames(combined_master_extended, sti_df, national_year_df, results, findings, provenance):
 out=ROOT/'dashboard_data'; out.mkdir(exist_ok=True)
 def save(name, value):
  if isinstance(value,pd.DataFrame): value=json.loads(value.to_json(orient='records',double_precision=6))
  (out/f'{name}.json').write_text(json.dumps(value,indent=2,allow_nan=False)+'\n')
 state=combined_master_extended.rename(columns=RENAME)[list(RENAME.values())]
 assert len(state)==176 and state[['state','year']].duplicated().sum()==0
 assert len(sti_df)==65 and sti_df['State'].nunique()==13
 save('state_year',state)
 save('sustainability_index',sti_df.rename(columns={'State':'state','Year':'year','PCA_STI_0_100':'stiScore'})[['state','year','stiScore']+[c for c in sti_df if re.match(r'PC\d+_Standardized$',c)]])
 save('national_year',national_year_df.rename(columns={'Year':'year','Domestic_Visitors_000':'visitors000','Tourism_Expenditure_RM_mil':'expenditureRmMil','CPI Accom':'cpiAccom','CPI Food Away':'cpiFoodAway','Marine_Excellent_Stations':'marineExcellent','Marine_Poor_Stations':'marinePoor'}))
 save('forecast',results.reset_index().rename(columns={'State':'state','2024_Actual':'actual2024','Raw_Model_2025':'rawForecast2025','Shrunk_Model_2025':'shrunkForecast2025','Real_2025_Actual':'actual2025','Shrunk_Error_%':'errorPct'}))
 save('causal_findings',findings)
 save('map_scores',sti_df[sti_df.Year==sti_df.Year.max()].set_index('State').PCA_STI_0_100.round(0).to_dict())
 save('metadata',{'dataVintage':'2015–2025 state visitors; 2012–2025 national series; 2020–2024 coastal index','lastUpdated':'2026-09-15','notebookVersion':'Data_Cleaning_v2.ipynb','sources':['OpenDOSM','data.gov.my'],'provenance':provenance,'caveats':['Missing observations are null, never zero or interpolated. Environmental coverage varies by indicator.','The PCA index covers 13 monitored states in 2020–2024; Perlis, Kuala Lumpur and Putrajaya have no index.','The forecast blends 50% toward no growth. A single 2025 comparison does not establish future accuracy.','The causal models report associations, with N=52 and HC1 standard errors; they do not establish causation.','State TSA visitor figures and the master panel use slightly different published precision. National totals are shown separately.']})
 combined_master_extended.to_csv(out/'Data.csv',index=False)
 for p in out.iterdir(): shutil.copy2(p,ROOT/'public/data'/p.name)
 shutil.copy2(out/'Data.csv',ROOT/'Data.csv')
 print('Exported 176 state-years, 65 index scores, 14 national years and 16 forecasts.')

def main():
 notebook=json.loads((ROOT/'Data_Cleaning_v2.ipynb').read_text())
 cells=notebook['cells']
 book=ROOT/'pipeline/source/Combined_dataset_updated.xlsx'
 master=pd.read_excel(book,sheet_name='Master_State_Year_v2')
 extended=pd.read_excel(book,sheet_name='Master_State_Year_extended')
 national=pd.read_excel(book,sheet_name='National_Year')
 # Execute the notebook's unchanged PCA calculation on its own exported master panel.
 scope={'combined_master_df':master}
 exec(''.join(cells[88]['source']),scope)
 sti=scope['sti_df']
 for i in range(scope['k']): sti[f'PC{i+1}_Standardized']=scope['pcs_standardized'][:,i]
 def stream(i): return ''.join(''.join(o.get('text',[])) for o in cells[i].get('outputs',[]))
 # Verify recomputation against every saved latest-year score (3-decimal printed precision).
 expected=[]
 for line in stream(92).splitlines():
  m=re.match(r'^\s*(.+?)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$',line)
  if m and m[1] in set(sti.State): expected.append((m[1],float(m[2])))
 assert len(expected)==13
 for state,value in expected:
  actual=sti.loc[(sti.State==state)&(sti.Year==2024),'PCA_STI_0_100'].iloc[0]
  assert abs(actual-value)<0.00051,(state,actual,value)
 # Validate workbook visitor and national panels against complete saved HTML tables.
 def html_table(i):
  html=next(o['data']['text/html'] for o in cells[i]['outputs'] if 'text/html' in o.get('data',{}))
  return pd.read_html(io.StringIO(''.join(html)))[0].iloc[:,1:]
 saved=html_table(11)
 for _,row in extended.iterrows():
  v=float(saved.loc[saved.State==row.State,str(int(row.Year))].iloc[0])
  assert abs(row.Domestic_Visitors_TSA_000-v)<0.001
 saved_national=html_table(84)
 for col in national:
  pd.testing.assert_series_equal(national[col],saved_national[col],check_dtype=False,check_names=False,atol=0.00001,rtol=0)
 rows=[]
 for line in stream(100).splitlines()[1:]:
  parts=line.split()
  if len(parts)>=7:
   try: nums=list(map(float,parts[-6:]))
   except ValueError: continue
   rows.append([' '.join(parts[:-6])]+nums)
 results=pd.DataFrame(rows,columns=['State','2024_Actual','Raw_Model_2025','Shrunk_Model_2025','Real_2025_Actual','Raw_Error_%','Shrunk_Error_%']).set_index('State')
 assert len(results)==16
 findings=[]
 for i,id,title,result in [(107,'forward','Does tourism intensity affect coastal quality?','No significant forward association at the 5% threshold'),(110,'reverse','Does coastal quality affect tourism receipts?','Positive association; borderline evidence'),(113,'robustness','Alternative exposure: visitor volume','No significant forward association')]:
  text=stream(i); n=int(re.search(r'N\s*=\s*(\d+)',text)[1])
  lines=[l.strip() for l in text.splitlines() if 'coef=' in l and any(v in l for v in ['Tourism_Receipts_lag1','LengthOfStay_lag1','Coastal_lag1','Visitors_lag1'])]
  findings.append({'id':id,'title':title,'result':result,'detail':' • '.join(lines),'n':n,'caveat':'Small observational panel with state and year fixed effects; not proof of causation.'})
 export_frames(extended,sti,national,results,findings,{'mode':'Notebook-exported workbook; PCA recomputed using cell 88 and checked against all 13 saved 2024 scores; forecasts and regression coefficients extracted from saved outputs.','workbook':'pipeline/source/Combined_dataset_updated.xlsx','workbookSha256':hashlib.sha256(book.read_bytes()).hexdigest(),'cells':[11,60,84,88,92,100,107,110,113]})

if __name__=='__main__': main()
