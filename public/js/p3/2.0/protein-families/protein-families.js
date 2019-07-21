
import React from 'react';
import { HotTable } from '@handsontable/react';
import axios from 'axios';

import config from '../config';
const { api } = config;

const licenseKey = 'non-commercial-and-evaluation'


const params = {
  jsonrpc: "2.0",
  method: "proteinFamily",
  params: [
    {
        familyType: "pgfam",
        heatmapAxis: "",
        genomeIds: [
            "35802.4",
            "35802.34",
            "35802.35",
            "35802.37",
            "35802.38",
            "35802.40",
            "1149952.3",
            "1912098.4",
            "1912099.4",
            "1388743.3"
        ]
    },
    { "token": "" }
  ]
};

const colHeaders = [
  "ID", "Proteins", "Genomes", "Description",
  "Min AA length", "Max AA length", "Mean", "Std Dev"
]

const columns = [
  {type: 'text'},
  {type: 'numeric'},
  {type: 'numeric'},
  {type: 'text', width: '200px'},
  {type: 'numeric'},
  {type: 'numeric'},
  {type: 'numeric'},
  {type: 'numeric'}
]

'use strict';

export class PFContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    }
  }

  componentDidMount() {
    axios.post(`${api}/`, params)
      .then((res) => {
        let objs = res.data.result;
        console.log('objects', objs);

        let data = objs.map(o => [
          o.family_id,
          o.feature_count,
          o.genome_count,
          o.description,
          o.aa_length_min,
          o.aa_length_max,
          Math.round(o.aa_length_mean),
          Math.round(o.aa_length_std)
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
            licenseKey: licenseKey
            }} />
        }
      </div>
    );

  }
};
