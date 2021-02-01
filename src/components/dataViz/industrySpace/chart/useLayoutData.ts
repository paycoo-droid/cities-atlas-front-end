import {useEffect, useState} from 'react';
import {
  useGlobalIndustryMap,
} from '../../../../hooks/useGlobalIndustriesData';
import LAYOUT_DATA from './data/layout_data.json';
// import CLUSTER_NAMES from './data/cluster-names.json';
import {
  ClassificationNaicsIndustry,
} from '../../../../types/graphQL/graphQLTypes';
import {
  sectorColorMap,
} from '../../../../styling/styleUtils';
import {
  useAggregateIndustryMap,
} from '../../../../hooks/useAggregateIndustriesData';
import {
  DigitLevel,
} from '../../../../types/graphQL/graphQLTypes';
import {defaultYear} from '../../../../Utils';
import {scaleLinear, scaleSymlog} from 'd3-scale';

// const mergedLayoutData = {
//   ...LAYOUT_DATA,
//   clusters: {
//     continents: LAYOUT_DATA.clusters.continents.map(c => {
//       const nameNode = CLUSTER_NAMES.C1.find(d => d.code === c.clusterCode);
//       if (!nameNode) {
//         throw new Error('Missing Cluster name for ' + c);
//       }
//       return {
//         ...c,
//         name: nameNode.name,
//       }
//     }),
//     countries: LAYOUT_DATA.clusters.countries.map(c => {
//       const nameNode = CLUSTER_NAMES.C2.find(d => d.code === c.clusterCode);
//       if (!nameNode) {
//         throw new Error('Missing Cluster name for ' + c);
//       }
//       return {
//         ...c,
//         name: nameNode.name,
//       }
//     }),
//   }
// }

// console.log(mergedLayoutData);

interface ContinentCluster {
  center: number[];
  color: string;
  clusterCode: number;
  clusterId: string;
  name: string;
  polygon: number[][];
}

interface CountryCluster extends ContinentCluster {
  continent: string;
}

interface Clusters {
  continents: ContinentCluster[];
  countries: CountryCluster[];
}

interface Edge {
  trg: ClassificationNaicsIndustry['id'];
  proximity: number;
}

interface Node {
  id: ClassificationNaicsIndustry['id'];
  name: ClassificationNaicsIndustry['name'];
  code: ClassificationNaicsIndustry['code'];
  industryColor: string;
  color: string;
  sectorName: string;
  continent: string;
  country: string;
  edges: Edge[];
  x: number;
  y: number;
  rca?: number;
  radius?: number;
  globalSumNumCompany: number;
}

export interface LayoutData {
  clusters: Clusters;
  nodes: Node[];
  global: {
    linearRadiusScale: (value: number) => number,
    logRadiusScale: (value: number) => number,
  };
}

interface Output {
  loading: boolean;
  error: any;
  data: LayoutData | undefined;
}

export const lowIntensityNodeColor = '#dddddd';

const useLayoutData = ():Output => {
  const [output, setOutput] = useState<Output>({
    loading: true,
    error: undefined,
    data: undefined,
  });

  const {loading, error, data: industryData} = useGlobalIndustryMap();

  const {
    loading: loadingIndustryMapData,
    data: industryMapData,
  } = useAggregateIndustryMap({level: DigitLevel.Six, year: defaultYear});

  useEffect(() => {
    if (!output.data) {
      if (error) {
        setOutput({loading: false, error, data: undefined});
      } else if (industryData && !loading && industryMapData && !loadingIndustryMapData) {

        const {globalMinMax, industries} = industryMapData;
        const minSizeBy = globalMinMax && globalMinMax.minSumNumCompany ? globalMinMax.minSumNumCompany : 0.001;
        const maxSizeBy = globalMinMax && globalMinMax.maxSumNumCompany ? globalMinMax.maxSumNumCompany : 1;
        const linearRadiusScale = scaleLinear()
          .domain([minSizeBy, maxSizeBy])
          .range([ 5, 15]);
        const logRadiusScale = scaleSymlog()
          .domain([minSizeBy, maxSizeBy])
          .range([ 2, 8.5]);

        const data: Output['data'] = {
          clusters: LAYOUT_DATA.clusters,
          nodes: LAYOUT_DATA.nodes.map(n => {
            const industry = industryData[n.id.toString()];
            const parent = industryData[industry.naicsIdTopParent.toString()];
            const parentIndustry = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
            const globalIndustry = industries[industry.naicsId];
            return {
              ...n,
              id: industry.naicsId,
              name: industry.name,
              code: industry.code,
              industryColor: parentIndustry ? parentIndustry.color : lowIntensityNodeColor,
              color: parentIndustry ? parentIndustry.color : lowIntensityNodeColor,
              sectorName: parent && parent.name ? parent.name : '',
              edges: n.edges.map(e => ({trg: e.trg.toString(), proximity: e.proximity})),
              globalSumNumCompany: globalIndustry ? globalIndustry.sumNumCompany : 0,
            };
          }),
          global: {
            linearRadiusScale, logRadiusScale,
          },
        };
        setOutput({loading: false, error: undefined, data});
      }
    }
  }, [output, loading, error, industryData, industryMapData, loadingIndustryMapData]);

  return output;
};

export default useLayoutData;

