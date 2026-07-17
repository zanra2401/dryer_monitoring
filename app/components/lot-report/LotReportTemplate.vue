<script setup lang="ts">
import type { LotReportData } from "~/composable/useLotReport";

const props = defineProps<{
  report: LotReportData;
}>();

const maxRows = 39;

const rows = computed(() => {
  const filledRows = props.report.rows.slice(0, maxRows);

  while (filledRows.length < maxRows) {
    filledRows.push({
      date: "",
      hour: "",
      minute: "",
      tempTop: "",
      tempBottom: "",
      rhTop: "",
      rhBottom: "",
      mc: "",
      status: "",
      tempTopValue: null,
      tempBottomValue: null,
      rhTopValue: null,
      rhBottomValue: null,
      mcValue: null,
      hourValue: null,
      minuteValue: null,
    });
  }

  return filledRows;
});
</script>

<template>
  <div class="lot-report-sheet">
    <table class="lot-report-table">
      <colgroup>
        <col class="col-b">
        <col class="col-c">
        <col class="col-d">
        <col class="col-e">
        <col class="col-f">
        <col class="col-g">
        <col class="col-h">
        <col class="col-i">
        <col class="col-j">
        <col class="col-k">
        <col class="col-l">
      </colgroup>

      <tbody>
        <tr>
          <td colspan="11" class="report-area">
            {{ report.dryerAreaName || "" }}
          </td>
        </tr>

        <tr>
          <td colspan="11" class="blank-row" />
        </tr>

        <tr>
          <td colspan="11" class="blank-row" />
        </tr>

        <tr>
          <td colspan="11" class="report-title">
            DRYING MONITORING REPORT
          </td>
        </tr>

        <tr>
          <td colspan="11" class="blank-row" />
        </tr>

        <tr class="summary-row">
          <td class="summary-label">
            Bin No
          </td>
          <td class="summary-value">
            : {{ report.binNumber }}
          </td>
          <td class="summary-label">
            Status Quality
          </td>
          <td class="summary-value">
            : {{ report.quality || "" }}
          </td>
          <td class="summary-label">
            Date/Time Start
          </td>
          <td class="summary-value summary-value-datetime">
            : {{ report.startTime || "" }}
          </td>
          <td class="summary-gap" />
          <td class="summary-label">
            MC Start
          </td>
          <td class="summary-value">
            : {{ report.mcStart || "" }}
          </td>
          <td class="summary-label">
            Hour
          </td>
          <td class="summary-value">
            : {{ report.hour || "" }}
          </td>
        </tr>

        <tr class="summary-row">
          <td class="summary-label">
            Lot No
          </td>
          <td class="summary-value">
            : {{ report.lotNumber }}
          </td>
          <td class="summary-label">
            Net To Bin (Kg)
          </td>
          <td class="summary-value">
            : {{ report.netToBin || "" }}
          </td>
          <td class="summary-label">
            Date/Time Down
          </td>
          <td class="summary-value summary-value-datetime">
            : {{ report.downTime || "" }}
          </td>
          <td class="summary-gap" />
          <td class="summary-label">
            MC Down
          </td>
          <td class="summary-value">
            : {{ report.mcDown || "" }}
          </td>
          <td class="summary-label">
            Dry down
          </td>
          <td class="summary-value">
            : {{ report.dryDown || "" }}
          </td>
        </tr>

        <tr class="summary-row">
          <td class="summary-label">
            Varietas
          </td>
          <td class="summary-value">
            : {{ report.hybrid || "" }}
          </td>
          <td class="summary-label">
            Depth (Meter)
          </td>
          <td class="summary-value">
            : {{ report.depthMeter || "" }}
          </td>
          <td class="summary-label">
            Date/Time Stop
          </td>
          <td class="summary-value summary-value-datetime">
            : {{ report.stopTime || "" }}
          </td>
          <td class="summary-gap" />
          <td class="summary-label">
            MC End
          </td>
          <td class="summary-value">
            : {{ report.mcEnd || "" }}
          </td>
          <td class="summary-label">
            Drying Rate
          </td>
          <td class="summary-value">
            : {{ report.dryingRate || "" }}
          </td>
        </tr>

        <tr>
          <td colspan="11" class="blank-row" />
        </tr>

        <tr>
          <td rowspan="2" class="table-head">
            Date/Time
          </td>
          <td rowspan="2" class="table-head">
            Hour
          </td>
          <td rowspan="2" class="table-head">
            Minute
          </td>
          <td colspan="2" class="table-head">
            Suhu (&deg;C)
          </td>
          <td colspan="2" class="table-head table-head-rh">
            RH (%)
          </td>
          <td rowspan="2" class="table-head">
            MC (%)
          </td>
          <td colspan="2" rowspan="2" class="table-head">
            Status
          </td>
          <td rowspan="2" class="table-head-spacer" />
        </tr>

        <tr>
          <td class="table-subhead">
            Top
          </td>
          <td class="table-subhead">
            Down
          </td>
          <td class="table-subhead">
            Top
          </td>
          <td class="table-subhead">
            Down
          </td>
        </tr>

        <tr>
          <td class="body-cell" />
          <td class="body-cell" />
          <td class="body-cell" />
          <td class="body-cell" />
          <td class="body-cell" />
          <td class="body-cell body-cell-small" />
          <td class="body-cell body-cell-small" />
          <td class="body-cell" />
          <td colspan="2" class="body-cell status-cell" />
          <td class="body-spacer" />
        </tr>

        <tr v-for="(row, index) in rows" :key="index">
          <td class="body-cell body-cell-date">
            {{ row.date }}
          </td>
          <td class="body-cell body-cell-center">
            {{ row.hour }}
          </td>
          <td class="body-cell body-cell-center">
            {{ row.minute }}
          </td>
          <td class="body-cell body-cell-sensor">
            {{ row.tempTop }}
          </td>
          <td class="body-cell body-cell-sensor">
            {{ row.tempBottom }}
          </td>
          <td class="body-cell body-cell-small body-cell-sensor">
            {{ row.rhTop }}
          </td>
          <td class="body-cell body-cell-small body-cell-sensor">
            {{ row.rhBottom }}
          </td>
          <td class="body-cell body-cell-sensor">
            {{ row.mc }}
          </td>
          <td colspan="2" class="body-cell status-cell">
            {{ row.status }}
          </td>
          <td class="body-spacer" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.lot-report-sheet {
  width: 100%;
  overflow-x: auto;
  background: white;
  font-family: Calibri, Arial, sans-serif;
}

.lot-report-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 762px;
  margin: 0 auto;
  background: white;
  color: #000;
}

.lot-report-table td {
  box-sizing: border-box;
  height: 14.45pt;
  padding: 0 3px;
  vertical-align: middle;
  overflow: hidden;
  line-height: 1.15;
}

.col-b { width: 52px; }
.col-c { width: 84px; }
.col-d { width: 79px; }
.col-e { width: 73px; }
.col-f { width: 86px; }
.col-g { width: 73px; }
.col-h { width: 53px; }
.col-i { width: 64px; }
.col-j { width: 70px; }
.col-k { width: 64px; }
.col-l { width: 64px; }

.blank-row {
  height: 14.45pt;
}

.report-title {
  height: 23.45pt !important;
  overflow: visible !important;
  font: 700 16pt/23.45pt Calibri, sans-serif;
  text-align: center;
}

.report-area {
  height: 14.45pt;
  font: 700 9pt/14.45pt Calibri, sans-serif;
  text-align: center;
}

.summary-row td {
  height: 14.45pt;
  font: 7pt/14.45pt Arial, sans-serif;
  white-space: nowrap;
}

.summary-label,
.summary-value,
.summary-gap {
  color: #000;
}

.summary-value {
  padding-right: 6px;
}

.summary-value-datetime {
  font-size: 6.2pt;
  line-height: 14.45pt;
  white-space: nowrap;
}

.table-head {
  border: 1px solid #000;
  background: #c0c0c0;
  color: #000;
  text-align: center;
  font: 700 6.2pt/1.15 Arial, sans-serif;
  white-space: normal;
  padding: 0 1px;
}

.table-head-rh {
  white-space: nowrap;
}

.table-subhead {
  border: 1px solid #000;
  background: #bfbfbf;
  color: #000;
  text-align: center;
  font: 700 6.2pt/1.15 Arial, sans-serif;
  padding: 0 1px;
}

.table-head-spacer {
  border: none;
  background: transparent;
}

.table-head,
.table-subhead,
.summary-row td,
.body-cell {
  box-sizing: border-box;
}

.body-cell {
  border: 1px solid #000;
  font: 7.2pt/14.45pt Calibri, sans-serif;
  white-space: nowrap;
}

.body-cell-small {
  font: 6.6pt/14.45pt Arial, sans-serif;
}

.body-cell-date {
  font: 5.7pt/14.45pt Arial, sans-serif;
}

.body-cell-center {
  text-align: center;
}

.body-cell-sensor {
  padding-left: 3px;
  padding-right: 3px;
}

.status-cell {
  text-align: center;
  white-space: nowrap;
  font-size: 5.9pt;
}

.body-spacer {
  border: none;
  background: transparent;
}

@media print {
  .lot-report-sheet {
    overflow: visible;
  }

  .lot-report-table {
    width: 100%;
    margin: 0;
  }
}
</style>
