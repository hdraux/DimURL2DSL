import DimensionsDSLConverter from './components/DimensionsDSLConverter'

function App() {
  return (
    <div className="container mx-auto px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800">Dimensions.ai URL to DSL Converter</h1>
        <p className="text-gray-600 mt-2">Convert Dimensions.ai URLs to Dimensions Search Language (DSL) queries</p>
      </header>
      
      <DimensionsDSLConverter />
      
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Dimensions.ai DSL Converter</p>
        <p className="mt-1">Not affiliated with Digital Science or Dimensions.ai</p>
      </footer>
    </div>
  )
}

export default App
