import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import { getExtendedOpenApiSpec } from '../lib/extendedOpenapi';
import Link from 'next/link';
import Head from 'next/head';

interface APIDocsProps {
  spec: any;
}

// Function to highlight JSON syntax
const syntaxHighlight = (json: string) => {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-red-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-gray-300 font-bold'; // key
        } else {
          cls = 'text-green-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-yellow-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-purple-400'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

// Generate example values for different types
const generateExampleValue = (schema: any): any => {
  if (!schema) return null;
  
  // Handle $ref (references to other schemas)
  if (schema.$ref) {
    return { example: "Referenced object" };
  }
  
  // Handle array type
  if (schema.type === 'array' && schema.items) {
    return [generateExampleValue(schema.items)];
  }
  
  // Handle different primitive types
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return "2023-01-01T00:00:00Z";
      if (schema.format === 'date') return "2023-01-01";
      if (schema.format === 'email') return "user@example.com";
      if (schema.format === 'uuid') return "123e4567-e89b-12d3-a456-426614174000";
      if (schema.format === 'uri') return "https://example.com";
      if (schema.enum && schema.enum.length > 0) return schema.enum[0];
      return "example string";
    case 'number':
    case 'integer':
      return 42;
    case 'boolean':
      return true;
    case 'object':
      if (!schema.properties) return {};
      
      const result: Record<string, any> = {};
      Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
        result[propName] = generateExampleValue(propSchema);
      });
      
      return result;
    default:
      return null;
  }
};

// Generate example request body
const generateExampleRequestBody = (requestBody: any): string => {
  if (!requestBody || !requestBody.content || !requestBody.content['application/json']) {
    return '{}';
  }
  
  const schema = requestBody.content['application/json'].schema;
  const example = generateExampleValue(schema);
  
  return JSON.stringify(example, null, 2);
};

// Generate example request body for JavaScript
const generateExampleRequestBodyJS = (requestBody: any): string => {
  if (!requestBody || !requestBody.content || !requestBody.content['application/json']) {
    return '{}';
  }
  
  const schema = requestBody.content['application/json'].schema;
  const example = generateExampleValue(schema);
  
  return JSON.stringify(example, null, 0);
};

const APIDocsPage: React.FC<APIDocsProps> = ({ spec }) => {
  const [activeSection, setActiveSection] = useState('info');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  
  // Process spec to organize by tags
  const taggedEndpoints = React.useMemo(() => {
    const result: Record<string, any[]> = {};
    
    // Add 'All' category
    result['All'] = [];
    
    if (spec.paths) {
      Object.entries(spec.paths).forEach(([path, pathData]: [string, any]) => {
        Object.entries(pathData).forEach(([method, endpointData]: [string, any]) => {
          const endpoint = {
            path,
            method: method.toUpperCase(),
            ...endpointData,
          };
          
          // Add to 'All' category
          result['All'].push(endpoint);
          
          // Add to specific tag categories
          if (endpointData.tags && endpointData.tags.length > 0) {
            endpointData.tags.forEach((tag: string) => {
              if (!result[tag]) {
                result[tag] = [];
              }
              result[tag].push(endpoint);
            });
          } else {
            // Add to 'Uncategorized' if no tags
            if (!result['Uncategorized']) {
              result['Uncategorized'] = [];
            }
            result['Uncategorized'].push(endpoint);
          }
        });
      });
    }
    
    return result;
  }, [spec]);
  
  // Toggle expanding a path
  const togglePath = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Method color mapping
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-600',
    POST: 'bg-green-600',
    PUT: 'bg-yellow-600',
    DELETE: 'bg-red-600',
    PATCH: 'bg-purple-600'
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Head>
        <title>API Documentation | Nostr Ad Marketplace</title>
        <meta name="description" content="API Documentation for the Nostr Ad Marketplace" />
      </Head>
      
      {/* Header */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">Nostr Ad Marketplace API</h1>
          <Link href="/" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4">Documentation</h2>
          
          <div className="mb-6">
            <button 
              onClick={() => setActiveSection('info')}
              className={`w-full text-left py-2 px-3 rounded ${activeSection === 'info' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              API Overview
            </button>
          </div>
          
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Endpoints</h3>
          <div className="space-y-1">
            {Object.keys(taggedEndpoints)
              .sort((a, b) => {
                // Keep 'All' at the top
                if (a === 'All') return -1;
                if (b === 'All') return 1;
                // Keep 'Uncategorized' at the bottom
                if (a === 'Uncategorized') return 1;
                if (b === 'Uncategorized') return -1;
                // Alphabetical sort for everything else
                return a.localeCompare(b);
              })
              .map(tag => (
                <button 
                  key={tag}
                  onClick={() => setActiveSection(tag)}
                  className={`w-full text-left py-2 px-3 rounded ${activeSection === tag ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {tag}
                </button>
              ))
            }
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => setActiveSection('schemas')}
              className={`w-full text-left py-2 px-3 rounded ${activeSection === 'schemas' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Schemas
            </button>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => setActiveSection('raw')}
              className={`w-full text-left py-2 px-3 rounded ${activeSection === 'raw' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              OpenAPI Spec
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow p-6 overflow-y-auto">
          {activeSection === 'info' && (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold text-white mb-4">{spec.info.title}</h1>
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div 
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: spec.info.description }}
                ></div>
                {spec.info.version && (
                  <p className="mt-2 text-sm text-gray-400">Version: {spec.info.version}</p>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-white mt-8 mb-4">Authentication</h2>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 mb-4">
                  This API requires authentication via API keys. To use the API, you'll need to:
                </p>
                <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                  <li>Generate an API key from your dashboard</li>
                  <li>Include the API key in the <code className="bg-gray-700 px-1 rounded">Authorization</code> header of your requests</li>
                </ol>
                <pre className="bg-gray-700 p-3 rounded mt-4 overflow-x-auto text-gray-300">
                  <code>
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </pre>
              </div>
            </div>
          )}
          
          {activeSection !== 'info' && activeSection !== 'schemas' && activeSection !== 'raw' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">{activeSection} Endpoints</h1>
              <div className="space-y-6">
                {taggedEndpoints[activeSection]?.map((endpoint, index) => (
                  <div key={`${endpoint.path}-${endpoint.method}-${index}`} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center p-4 cursor-pointer"
                      onClick={() => togglePath(`${endpoint.path}-${endpoint.method}`)}
                    >
                      <span className={`px-2 py-1 rounded text-xs font-bold ${methodColors[endpoint.method] || 'bg-gray-600'}`}>
                        {endpoint.method}
                      </span>
                      <span className="ml-3 font-mono text-gray-300">{endpoint.path}</span>
                      <span className="ml-auto text-gray-400">{endpoint.summary}</span>
                    </div>
                    
                    {expandedPaths[`${endpoint.path}-${endpoint.method}`] && (
                      <div className="border-t border-gray-700 p-4">
                        {endpoint.description && (
                          <div className="mb-4">
                            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Description</h3>
                            <div 
                              className="text-gray-300"
                              dangerouslySetInnerHTML={{ __html: endpoint.description }}
                            ></div>
                          </div>
                        )}
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Parameters</h3>
                            <div className="bg-gray-700 rounded-lg overflow-hidden">
                              <table className="min-w-full">
                                <thead>
                                  <tr className="bg-gray-900">
                                    <th className="px-4 py-2 text-left text-xs text-gray-300">Name</th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-300">In</th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-300">Type</th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-300">Required</th>
                                    <th className="px-4 py-2 text-left text-xs text-gray-300">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param: any, paramIndex: number) => (
                                    <tr key={paramIndex} className="border-t border-gray-800">
                                      <td className="px-4 py-2 text-sm text-gray-300 font-mono">{param.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-300">{param.in}</td>
                                      <td className="px-4 py-2 text-sm text-gray-300">{param.schema?.type || 'object'}</td>
                                      <td className="px-4 py-2 text-sm text-gray-300">{param.required ? 'Yes' : 'No'}</td>
                                      <td className="px-4 py-2 text-sm text-gray-300">
                                        {param.description ? (
                                          <div dangerouslySetInnerHTML={{ __html: param.description }}></div>
                                        ) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {endpoint.requestBody && (
                          <div className="mb-4">
                            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Request Body</h3>
                            <div className="bg-gray-700 rounded-lg p-4">
                              <pre className="text-sm text-gray-300 overflow-x-auto">
                                <div dangerouslySetInnerHTML={{ 
                                  __html: syntaxHighlight(JSON.stringify(endpoint.requestBody, null, 2))
                                }} />
                              </pre>
                            </div>
                            
                            {/* Example request */}
                            <div className="mt-4">
                              <h4 className="text-sm text-gray-400 mb-2">Example Request</h4>
                              <div className="bg-gray-900 rounded-lg p-4">
                                {endpoint.method === 'GET' ? (
                                  <div>
                                    <h5 className="text-xs text-gray-400 mb-2">cURL</h5>
                                    <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                      {`curl -X ${endpoint.method} "${window.location.origin}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                                    </pre>
                                    
                                    <h5 className="text-xs text-gray-400 mt-4 mb-2">JavaScript</h5>
                                    <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                      {`// Using fetch API
fetch("${window.location.origin}${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`}
                                    </pre>
                                  </div>
                                ) : (
                                  <div>
                                    <h5 className="text-xs text-gray-400 mb-2">cURL</h5>
                                    <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                      {`curl -X ${endpoint.method} "${window.location.origin}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${generateExampleRequestBody(endpoint.requestBody)}'`}
                                    </pre>
                                    
                                    <h5 className="text-xs text-gray-400 mt-4 mb-2">JavaScript</h5>
                                    <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                      {`// Using fetch API
fetch("${window.location.origin}${endpoint.path}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${generateExampleRequestBodyJS(endpoint.requestBody)})
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {endpoint.responses && (
                          <div>
                            <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Responses</h3>
                            <div className="space-y-3">
                              {Object.entries(endpoint.responses).map(([code, response]: [string, any], respIndex: number) => (
                                <div key={respIndex} className="bg-gray-700 rounded-lg p-4">
                                  <div className="flex items-center mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      code.startsWith('2') ? 'bg-green-600' : 
                                      code.startsWith('4') ? 'bg-yellow-600' : 
                                      code.startsWith('5') ? 'bg-red-600' : 'bg-blue-600'
                                    }`}>
                                      {code}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-300">
                                      {response.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: response.description }}></div>
                                      ) : 'Response'}
                                    </span>
                                  </div>
                                  
                                  {response.content && response.content['application/json'] && response.content['application/json'].schema && (
                                    <div className="mt-2">
                                      <h4 className="text-xs text-gray-400 mb-2">Schema</h4>
                                      <pre className="text-sm text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
                                        <div dangerouslySetInnerHTML={{ 
                                          __html: syntaxHighlight(JSON.stringify(response.content['application/json'].schema, null, 2))
                                        }} />
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'schemas' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Schemas</h1>
              <div className="space-y-6">
                {spec.components && spec.components.schemas && Object.entries(spec.components.schemas).map(([schemaName, schema]: [string, any], schemaIndex: number) => (
                  <div key={schemaIndex} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h2 className="text-xl font-mono text-purple-400">{schemaName}</h2>
                      {schema.description && (
                        <p className="text-gray-300 mt-2">{schema.description}</p>
                      )}
                      <div className="mt-4">
                        <pre className="text-sm text-gray-300 bg-gray-700 p-3 rounded overflow-x-auto">
                          <div dangerouslySetInnerHTML={{ 
                            __html: syntaxHighlight(JSON.stringify(schema, null, 2))
                          }} />
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'raw' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">OpenAPI Specification</h1>
              <div className="bg-gray-800 rounded-lg overflow-hidden p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ 
                    __html: syntaxHighlight(JSON.stringify(spec, null, 2))
                  }} />
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const spec = await getExtendedOpenApiSpec();
  
  return {
    props: {
      spec,
    },
  };
};

export default APIDocsPage;