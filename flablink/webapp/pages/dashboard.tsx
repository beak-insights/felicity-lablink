import useWebSocket from 'react-use-websocket';
import * as echarts from 'echarts';
import {
  Hash,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import InstrumentCard from "@/components/dashboard/instrument-card";
import LayoutAdmin from "@/components/layouts/admin";


import { useInstrumentsStore } from "@/store/instruments";
import { 
  useDashBoardStore, 
  Syncs, 
  DailyData, HourlyData, WeeklyData
 } from '@/store/dashboard';
import { useEffect } from 'react';
import { useWs } from '@/utils';
import { WS_CLIENT_ID } from '@/constant';
import LimsCard from '@/components/dashboard/lims-card';

function DashBoardPage() {
  const { lastMessage } = useWebSocket(useWs(`/ws/${WS_CLIENT_ID}`));  
  const { instruments, fetchtInstruments, instrumentActivity } = useInstrumentsStore()
  const { 
    sync, last_creation, last_sync, 
    created_daily, created_hourly,
    synced_daily, synced_hourly,
    forwarders,
    fetchStatictics, fetchForwarder, forwarderActivity, // fetchForwarderPerf
  } = useDashBoardStore()

  useEffect(() => {
    fetchtInstruments();
    fetchStatictics();
    fetchForwarder();
  },[])

  useEffect(() => {
    plotChart(created_hourly, 'hCreation', 'hour', "Interfacing Hourly Monitor")
    plotChart(created_daily, 'dCreation', 'date', "Interfacing Daily Monitor")
    plotChart(synced_hourly, 'hSync', 'hour', "Syncing Hourly Monitor")
    plotChart(synced_daily, 'dSync', 'date', "Syncing Daily Monitor")
  },[created_hourly])

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      if (data.target === "instrument") {
        instrumentActivity(data);
      }
      if (data.target === "forwarder") {
        forwarderActivity(data);
      }
    }
  }, [lastMessage]);


  const syncTileNumber = (data: Syncs[], s: number) => {
    switch (s) {
        case 0:
            const x = data.find((item) => item.synced === 0);
            return x ? x.total : 0;
        case 1:
            const y = data.find((item) => item.synced === 1);
            return y ? y.total : 0;
        case 10:
            return data.reduce((acc, item) => acc + item.total, 0);
        default:
            const other = data.find((item) => ![0, 1].includes(item.synced));
            return other ? other.total : 0;
    }
  }

  const instrumentName = (uid: number) => instruments?.find(ins => ins.uid == uid)?.name
  
  function timeAgo(input: Date | string | number) {
    if (!input) return ": not yet started";
    const date = (input instanceof Date) ? input : new Date(input);
    const formatter = new Intl.RelativeTimeFormat('en');
    const ranges = [
      ['years', 3600 * 24 * 365],
      ['months', 3600 * 24 * 30],
      ['weeks', 3600 * 24 * 7],
      ['days', 3600 * 24],
      ['hours', 3600],
      ['minutes', 60],
      ['seconds', 1],
    ] as const;
    const secondsElapsed = (date.getTime() - Date.now()) / 1000;
   
    for (const [rangeType, rangeVal] of ranges) {
      if (rangeVal < Math.abs(secondsElapsed)) {
        const delta = secondsElapsed / rangeVal;
        return formatter.format(Math.round(delta), rangeType);
      }
    }
  }

  const minToTimeAgo = (minutes: number) => {
      if (minutes <= 0) {
          return "just now";
      } else if (minutes === 1) {
          return "1 minute ago";
      } else if (minutes < 60) {
          return `${minutes} minutes ago`;
      } else {
          const hours = Math.floor(minutes / 60);
          if (hours === 1) {
              return "1 hour ago";
          } else if (hours < 24) {
              return `${hours} hours ago`;
          } else {
              const days = Math.floor(hours / 24);
              if (days === 1) {
                  return "1 day ago";
              } else {
                  return `${days} days ago`;
              }
          }
      }
  }

  function timeLineETL(dataset: DailyData[] | HourlyData[] | WeeklyData[], target: string): { columns: string[], data: any[] }{
    dataset = dataset.map((item: any) => ({...item, instrument: instrumentName(item["instrument_uid"])}))
    return {
      columns: ['hour', ...Array.from(new Set(dataset.map((item: any) => item.instrument)))],
      data: Array.from(new Set(dataset.map((item: any) => item[target]))).map(hour => {
        const hourData = dataset.filter((item: any) => item[target] === hour);
        return {
          hour: hour,
          ...hourData.reduce((acc, current:any) => {
            return { ...acc, [current["instrument"]]: current.count };
          }, {})
        };
      }),
    };
  }

  const plotChart = (data: DailyData[] | HourlyData[] | WeeklyData[], id: string, target: string, title: string = "") => {
    let daChartDom = document.getElementById(id);

    if (daChartDom && echarts.getInstanceByDom(daChartDom)) {
      echarts.getInstanceByDom(daChartDom)?.dispose();
    }

    let daChart = echarts.init(daChartDom);

    const dataset = timeLineETL(data, target);

    daChart.setOption({
      title: {
        text: title,
        left: 'center'
      },
      legend: { y: 30 },
      tooltip: {},
      dataset: {
        dimensions: dataset.columns,
        source: dataset.data,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      },
      xAxis: { type: 'category' },
      yAxis: {},
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: [{ type: 'bar' }, { type: 'bar' }]
    });

  }
  
  return (
    <LayoutAdmin>
      <div className="grid grid-cols-12 gap-x-4 w-full">

        <div className="col-span-12">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Samples
                </CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncTileNumber(sync, 10)}</div>
                <Carousel
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  plugins={[
                    Autoplay({delay: 3000}),
                  ]} 
                  orientation='horizontal'
                  className="w-full max-w-xs text-xs text-muted-foreground">
                  <CarouselContent>
                    {last_creation.map((lc, index) => (
                      <CarouselItem key={index}>
                        <span className="font-semibold">{instrumentName(lc.instrument_uid)}</span>
                        <span> last interfaced {minToTimeAgo(lc.minutes_ago)}</span>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Synced
                </CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncTileNumber(sync, 1)}</div>
                <p className="text-xs text-muted-foreground">
                  
                </p>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Syncing
                </CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncTileNumber(sync, 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Last synced to LIMS {timeAgo(last_sync)}
                </p>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Skipped
                </CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncTileNumber(sync, 3)}</div>
                <p className="text-xs text-muted-foreground">
                  {}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-12 my-8">
          <hr className='' />
        </div>
        
        <div className="col-span-9">
          {/* <h2 className='text-2xl font-bold'>Interfacing Time Lines</h2> */}
          <div className='flex justify-around gap-x-4 mb-4'>
            <div id="dCreation" style={{width: "500px", height: "250px"}}></div>
            <div id="hCreation" style={{width: "500px", height: "250px"}}></div>
          </div>

          {/* <h2 className='text-2xl font-bold'>Syncing Time Lines</h2> */}
          <div className='flex justify-around gap-x-4'>
            <div id="dSync" style={{width: "500px", height: "250px"}}></div>
            <div id="hSync" style={{width: "500px", height: "250px"}}></div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-2">
          <h2 className='font-bold uppercase text-slate-600 text-2xl mb-2'>LIMS Connection</h2>
          {forwarders.map((forwarder) => (<LimsCard forwarder={forwarder} key={forwarder.uid} />))}
          <hr className='mt-4 mb-0' />
          <h2 className='font-bold uppercase text-slate-600 text-2xl'>Instrument Connection</h2>
          <hr className='mb-4' />
          {instruments.map((instrument) => (<InstrumentCard instrument={instrument} key={instrument.uid} />))}
        </div>
      </div>
    </LayoutAdmin>
  )
}

export default DashBoardPage
