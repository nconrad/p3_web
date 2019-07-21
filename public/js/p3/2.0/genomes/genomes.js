
import React from 'react';
import { HotTable } from '@handsontable/react';
import axios from 'axios';

import config from '../config';
const { api } = config;

const licenseKey = 'non-commercial-and-evaluation'

const getOpts =  {
  headers: {'Cache-Control': 'only-if-cached'}
}

const colHeaders = [
  "Genome Name", "ID", "Genome Status", "Contigs",
  "PATRIC CDS", "Isolation Country", "Host Name", "Collection Year",
  "Completion Date"
]

const columns = [
  {type: 'text'},
  {type: 'numeric'},
  {type: 'text'},
  {type: 'numeric'},
  {type: 'numeric'},
  {type: 'text'},
  {type: 'text'},
  {type: 'numeric'},
  {type: 'text'},
]

'use strict';

export class Genomes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    }
  }

  componentDidMount() {
    console.log('requesting...')
    let q = '?eq(taxon_lineage_ids,234)&sort(-score)&limit(200)'
    axios.get(`${api}/genome/${q}`, getOpts)
      .then((res) => {
        console.log('res', res)
        let objs = res.data;
        console.log('objects', objs);

        let data = objs.map(o => [
          o.genome_name,
          o.genome_id,
          o.genome_status,
          o.contigs,
          o.patric_cds,
          o.isolation_country,
          o.host_name,
          o.collection_year,
          o.completion_date
        ])

        this.setState({data});
      });
  }


  render() {
    let {data} = this.state;

    return (
      <div>

        {!data && 'loading...'}
        {data &&
          <HotTable settings={{
            data: data,
            width: '100%',
            height: '70%',
            wordWrap: false,
            columns,
            colHeaders,
            multiColumnSorting: true,
            manualColumnResize: true,
            manualColumnMove: true,
            rowHeaders: true,
            manualRowResize: false,
            stretchH: 'all',
            filters: true,
            visibleRows: 200,
            licenseKey: licenseKey
            }} />
        }
      </div>
    );

  }
};
