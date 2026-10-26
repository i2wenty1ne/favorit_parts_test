import { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import ApiSettings from './components/ApiSettings.jsx';
import BrandList from './components/BrandList.jsx';
import { Footer, Header, Sidebar } from './components/Layout.jsx';
import Offers from './components/Offers.jsx';
import PageIntro, { SearchHint } from './components/PageIntro.jsx';
import SearchForm from './components/SearchForm.jsx';
import SearchHistory from './components/SearchHistory.jsx';
import usePartsSearch from './hooks/usePartsSearch.js';
import useSearchHistory from './hooks/useSearchHistory.js';

export default function App() {
  const { search, searchBrands, searchOffers, changeQuery, chooseBrand, changeMode } =
    usePartsSearch();
  const { history, clearHistory } = useSearchHistory(search.searchedNumber, search.brandsStatus);
  const [activeView, setActiveView] = useState('search');
  const settingsRef = useRef(null);

  function openSettings() {
    settingsRef.current.showModal();
  }

  function repeatSearch(number) {
    setActiveView('search');
    changeQuery(number);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Перейти к поиску
      </a>
      <Sidebar
        activeView={activeView}
        recentCount={history.length}
        mode={search.mode}
        onNavigate={setActiveView}
        onOpenSettings={openSettings}
      />
      <div className="main-shell">
        <Header activeView={activeView} mode={search.mode} onOpenSettings={openSettings} />
        <main id="main" className="main-content">
          {activeView === 'history' ? (
            <SearchHistory
              history={history}
              onClear={clearHistory}
              onSelect={repeatSearch}
              onBack={() => setActiveView('search')}
            />
          ) : (
            <>
              <PageIntro />
              <SearchForm
                query={search.query}
                loading={search.brandsStatus === 'loading'}
                onChange={changeQuery}
                onSearch={searchBrands}
              />
              <div className="steps" aria-label="Этапы поиска">
                <div className={search.selectedBrand ? 'complete' : 'current'}>
                  <span className="step-number">
                    {search.selectedBrand ? <Check size={13} /> : '1'}
                  </span>
                  <span>Выберите производителя</span>
                </div>
                <div className="step-line" />
                <div className={search.selectedBrand ? 'current' : ''}>
                  <span className="step-number">2</span>
                  <span>Сравните предложения</span>
                </div>
              </div>
              <BrandList
                brands={search.brands}
                selectedBrand={search.selectedBrand}
                number={search.searchedNumber}
                mode={search.mode}
                status={search.brandsStatus}
                error={search.brandsError}
                onSelect={chooseBrand}
                onRetry={searchBrands}
              />
              <Offers
                key={search.selectedBrand || 'empty'}
                brands={search.brands}
                selectedBrand={search.selectedBrand}
                offers={search.offers}
                status={search.offersStatus}
                error={search.offersError}
                number={search.searchedNumber}
                mode={search.mode}
                onRetry={searchOffers}
              />
              <SearchHint />
            </>
          )}
          <Footer mode={search.mode} />
        </main>
      </div>
      <ApiSettings
        dialogRef={settingsRef}
        mode={search.mode}
        configured={search.configured}
        onModeChange={changeMode}
      />
    </div>
  );
}
