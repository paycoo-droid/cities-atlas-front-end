import React, {useState, useRef} from 'react';
import UtiltyBar, {DownloadType} from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import CompositionTreeMap from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';
import {
  ClassificationNaicsIndustry,
  CompositionType,
  defaultDigitLevel,
  defaultCompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import styled from 'styled-components/macro';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useSectorMap from '../../../../../hooks/useSectorMap';
import DownloadImageOverlay from './DownloadImageOverlay';
import noop from 'lodash/noop';
import useQueryParams from '../../../../../hooks/useQueryParams';

const TreeMapRoot = styled.div`
  display: contents;
`;

interface Props {
  cityId: string;
}

const EconomicComposition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const {digit_level, composition_type} = useQueryParams();
  const sectorMap = useSectorMap();
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);
  const [activeDownload, setActiveDownload] = useState<DownloadType | null>(null);
  const closeDownload = () => setActiveDownload(null);
  const treeMapRef = useRef<HTMLDivElement | null>(null);
  const globalLocationData = useGlobalLocationData();

  let download: React.ReactElement<any> | null;
  if (activeDownload === DownloadType.Image && treeMapRef.current) {
    const cellsNode = treeMapRef.current.querySelector('div.react-canvas-tree-map-masterContainer');
    if (cellsNode) {
      const targetCity = globalLocationData.data && globalLocationData.data.cities.find(c => c.cityId === cityId);
      download = (
        <DownloadImageOverlay
          onClose={closeDownload}
          cityId={parseInt(cityId, 10)}
          cityName={targetCity && targetCity.name ? targetCity.name : undefined}
          year={defaultYear}
          digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
          hiddenSectors={hiddenSectors}
          treeMapCellsNode={cellsNode as HTMLDivElement}
        />
      );
    } else {
      download = null;
      setActiveDownload(null);
    }
  } else {
    download = null;
  }

  return (
    <>
      <ContentGrid>
        <StandardSideTextBlock>
          <h2>Employment &amp; Industry Composition</h2>

          {/* eslint-disable-next-line */}
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

        </StandardSideTextBlock>
        <TreeMapRoot ref={treeMapRef}>
          <CompositionTreeMap
            cityId={parseInt(cityId, 10)}
            year={defaultYear}
            digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
            compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
            highlighted={highlighted}
            hiddenSectors={hiddenSectors}
            setHighlighted={setHighlighted}
          />
        </TreeMapRoot>
        <CategoryLabels
          categories={sectorMap}
          toggleCategory={toggleSector}
          isolateCategory={isolateSector}
          hiddenCategories={hiddenSectors}
        />
        {download}
      </ContentGrid>
      <UtiltyBar
        onDownloadImageButtonClick={
          cityId !== null && treeMapRef.current ? () => setActiveDownload(DownloadType.Image) : noop
        }
        onDownloadDataButtonClick={noop}
      />
    </>
  );
};

export default EconomicComposition;
