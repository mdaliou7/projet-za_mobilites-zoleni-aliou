/** API Prochains passages (SIRI Lite) : `/stop-monitoring`. */

export interface SiriText {
  value: string;
}

export interface MonitoredStopVisit {
  MonitoredVehicleJourney?: {
    LineRef?: SiriText;
    DestinationName?: SiriText[];
    MonitoredCall?: {
      StopPointName?: SiriText[];
      ExpectedDepartureTime?: string;
      ExpectedArrivalTime?: string;
      DepartureStatus?: string;
    };
  };
}

export interface StopMonitoringResponse {
  Siri?: {
    ServiceDelivery?: {
      StopMonitoringDelivery?: { MonitoredStopVisit?: MonitoredStopVisit[] }[];
    };
  };
}
