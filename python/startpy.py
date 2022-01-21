## Script takes in 7 arguments:
## 1. Stock Symbol
## 2. Start Date Year
## 3. Start Date Month (1, not 01)
## 4. Start Date Day (1, not 01)
## 5. End Date Year
## 6. End Date Month (1, not 01)
## 7. End Date Day (1, not 01)
## 8. Interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
## e.g py startpy.py RR.L 2022 1 4 2022 1 5

print("Starting Python Script 'startpy.py'")

## For cmd arguments
import sys

## Get stock data
import yfinance as yf
import mplfinance as mpf
from datetime import datetime
sd = datetime(int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]))
ed = datetime(int(sys.argv[5]), int(sys.argv[6]), int(sys.argv[7]))
df = yf.download(tickers=str(sys.argv[1]), start=sd, end=ed, interval=str(sys.argv[8]))


## Write to file
##print(df)
out = df.to_json(orient='records')[1:-1]
##.replace('},{', '} {')
with open(str(sys.argv[1])+ ".txt", 'w') as f:
    f.write(out)

## Display in graph    
##mpf.plot(df,type='candle',mav=(3,6,9),volume=True)

print("Ended Python Script 'startpy.py'")
