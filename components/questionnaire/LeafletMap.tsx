"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LeafletMapProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
  questionnaireId?: string;
}

export default function LeafletMap({
  question,
  value,
  onChange,
  questionnaireId,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const kmlLayersRef = useRef<Map<string, L.LayerGroup>>(new Map());
  const selectedLayerRef = useRef<L.LayerGroup | null>(null);
  const [kmlLoadingStatus, setKmlLoadingStatus] = useState<
    Map<string, "loading" | "loaded" | "error">
  >(new Map());
  const [selectedLayerId, setSelectedLayerId] = useState<string>("");

  // Debug logging function
  const addDebugInfo = (message: string) => {
    console.log(`[LeafletMap] ${message}`);
  };

  // Get KML files (no filtering - route availability removed)
  const getFilteredKmlFiles = () => {
    return question.kmlFiles || [];
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    addDebugInfo("Initializing map...");

    // Initialize map
    const map = L.map(mapRef.current).setView(
      question.defaultCenter || [23.8, 121.0], // Default to Taiwan center
      question.defaultZoom || 7
    );

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
    addDebugInfo("Map initialized successfully");

    // Add option markers (without click handlers)
    if (question.options) {
      addDebugInfo(`Adding ${question.options.length} option markers...`);
      question.options.forEach((option: any, index: number) => {
        if (option.coordinates) {
          const marker = L.marker(option.coordinates)
            .addTo(map)
            .bindPopup(
              `<strong>${option.label}</strong><br/>${option.description || ""}`
            );

          markersRef.current.push(marker);
        }
      });
      addDebugInfo(`Added ${markersRef.current.length} markers`);
    }

    // Load filtered KML files if provided
    const filteredKmlFiles = getFilteredKmlFiles();
    if (filteredKmlFiles && filteredKmlFiles.length > 0) {
      addDebugInfo(`Loading ${filteredKmlFiles.length} filtered KML files...`);
      loadMultipleKML(map, filteredKmlFiles);
    }
    // Fallback to single KML for backward compatibility
    else if (question.kmlUrl || question.kmlData) {
      addDebugInfo("Loading single KML file...");
      loadSingleKML(map);
    } else {
      addDebugInfo("No KML files to load");
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      kmlLayersRef.current.clear();
      selectedLayerRef.current = null;
      addDebugInfo("Map cleaned up");
    };
  }, []);

  // Update visual feedback when value changes
  useEffect(() => {
    updateSelectedLayerDisplay();
  }, [value]);

  const selectLayer = (layerId: string, layerName: string) => {
    const map = mapInstanceRef.current;
    const layer = kmlLayersRef.current.get(layerId);

    if (!map || !layer) {
      addDebugInfo(`Cannot select layer ${layerId}: map or layer not found`);
      return;
    }

    // Clear previous selection
    if (selectedLayerRef.current && selectedLayerId) {
      resetLayerStyle(selectedLayerRef.current);
      map.removeLayer(selectedLayerRef.current);
    }

    // Set new selection
    selectedLayerRef.current = layer;
    setSelectedLayerId(layerId);
    onChange(layerName); // Save layer name as the answer

    // Add layer to map and apply selection styling
    layer.addTo(map);
    applySelectedStyle(layer);

    // Auto-fit map to selected layer
    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1));
        addDebugInfo(`Auto-fitted map to selected layer: ${layerName}`);
      }
    } catch (error) {
      addDebugInfo(`Could not auto-fit to selected layer: ${error}`);
    }

    addDebugInfo(`Selected layer: ${layerName} (${layerId})`);
  };

  const applySelectedStyle = (layer: L.LayerGroup) => {
    layer.eachLayer((feature: L.Layer) => {
      if (feature instanceof L.Polyline) {
        feature.setStyle({
          color: "#ff0000",
          weight: 6,
          opacity: 1,
        });
      }
    });
  };

  const resetLayerStyle = (layer: L.LayerGroup) => {
    layer.eachLayer((feature: L.Layer) => {
      if (feature instanceof L.Polyline) {
        feature.setStyle({
          color: "#3388ff",
          weight: 4,
          opacity: 0.8,
        });
      }
    });
  };

  const updateSelectedLayerDisplay = () => {
    if (!value) {
      // Clear selection if no value
      if (selectedLayerRef.current && selectedLayerId) {
        const map = mapInstanceRef.current;
        if (map) {
          resetLayerStyle(selectedLayerRef.current);
          map.removeLayer(selectedLayerRef.current);
        }
        selectedLayerRef.current = null;
        setSelectedLayerId("");
      }
      return;
    }

    // Find the layer that matches the current value from filtered routes
    const filteredKmlFiles = getFilteredKmlFiles();
    const matchingKmlFile = filteredKmlFiles?.find(
      (kml: any) => kml.name === value
    );
    if (matchingKmlFile) {
      const layer = kmlLayersRef.current.get(matchingKmlFile.id);
      if (layer) {
        const map = mapInstanceRef.current;
        if (map) {
          // Clear previous selection
          if (
            selectedLayerRef.current &&
            selectedLayerId !== matchingKmlFile.id
          ) {
            resetLayerStyle(selectedLayerRef.current);
            map.removeLayer(selectedLayerRef.current);
          }

          // Set new selection
          selectedLayerRef.current = layer;
          setSelectedLayerId(matchingKmlFile.id);

          // Add layer to map and apply selection styling
          layer.addTo(map);
          applySelectedStyle(layer);

          // Auto-fit map to selected layer
          try {
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds.pad(0.1));
            }
          } catch (error) {
            addDebugInfo(`Could not auto-fit to layer: ${error}`);
          }
        }
      }
    }
  };

  const clearSelection = () => {
    const map = mapInstanceRef.current;
    if (selectedLayerRef.current && map) {
      resetLayerStyle(selectedLayerRef.current);
      map.removeLayer(selectedLayerRef.current);
    }
    selectedLayerRef.current = null;
    setSelectedLayerId("");
    onChange("");
    addDebugInfo("Selection cleared");
  };

  const loadMultipleKML = async (map: L.Map, kmlFilesToLoad?: any[]) => {
    const allBounds: L.LatLngBounds[] = [];
    const kmlFiles = kmlFilesToLoad || question.kmlFiles;
    addDebugInfo(`Starting to load ${kmlFiles.length} KML files`);

    for (const kmlFile of kmlFiles) {
      // Use encodeURI for proper URL encoding
      const encodedUrl = encodeURI(kmlFile.url);
      addDebugInfo(`Loading KML: ${kmlFile.name} from ${encodedUrl}`);
      setKmlLoadingStatus((prev) => new Map(prev).set(kmlFile.id, "loading"));

      try {
        // Validate file hosting and fetch with proper encoding
        addDebugInfo(`Fetching KML from: ${encodedUrl}`);
        const response = await fetch(encodedUrl);

        addDebugInfo(
          `Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const kmlContent = await response.text();
        addDebugInfo(
          `Fetched KML content for ${kmlFile.name}, length: ${kmlContent.length} chars`
        );

        // Validate that we got actual KML content
        const hasKmlRoot =
          kmlContent.includes("<kml") || kmlContent.includes("<?xml");
        addDebugInfo(`KML validation - Has KML/XML root: ${hasKmlRoot}`);

        if (!hasKmlRoot) {
          throw new Error("Response does not contain valid KML/XML content");
        }

        // Parse without cleaning first, then fallback if needed
        const layer = await parseKMLContent(kmlContent, kmlFile, map);
        const layerCount = layer.getLayers().length;
        addDebugInfo(`Parsed ${layerCount} features from ${kmlFile.name}`);

        if (layerCount === 0) {
          addDebugInfo(`WARNING: No features found in ${kmlFile.name}`);
        } else {
          // Auto-fit map to layer bounds
          try {
            const layerBounds = layer.getBounds();
            if (layerBounds.isValid()) {
              allBounds.push(layerBounds);
              addDebugInfo(`Collected valid bounds for ${kmlFile.name}`);
            }
          } catch (boundsError) {
            addDebugInfo(
              `Could not get bounds for ${kmlFile.name}: ${boundsError}`
            );
          }
        }

        kmlLayersRef.current.set(kmlFile.id, layer);
        setKmlLoadingStatus((prev) => new Map(prev).set(kmlFile.id, "loaded"));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addDebugInfo(`ERROR loading ${kmlFile.name}: ${errorMsg}`);
        console.error(`Error loading KML file ${kmlFile.name}:`, error);
        setKmlLoadingStatus((prev) => new Map(prev).set(kmlFile.id, "error"));
      }
    }

    // Fit map to show all KML content initially
    if (allBounds.length > 0) {
      try {
        const combinedBounds = allBounds.reduce((acc, bounds) =>
          acc.extend(bounds)
        );
        map.fitBounds(combinedBounds.pad(0.1));
        addDebugInfo(
          `Fitted map to combined bounds of ${allBounds.length} layers`
        );
      } catch (error) {
        addDebugInfo(`ERROR fitting bounds: ${error}`);
      }
    } else {
      addDebugInfo("No valid bounds found, keeping default view");
    }
  };

  const loadSingleKML = async (map: L.Map) => {
    try {
      let kmlContent = "";

      if (question.kmlUrl) {
        const encodedUrl = encodeURI(question.kmlUrl);
        addDebugInfo(`Loading single KML from URL: ${encodedUrl}`);
        const response = await fetch(encodedUrl);
        kmlContent = await response.text();
      } else if (question.kmlData) {
        addDebugInfo("Using provided KML data");
        kmlContent = question.kmlData;
      }

      if (kmlContent) {
        addDebugInfo(`Parsing single KML, length: ${kmlContent.length} chars`);
        const layer = await parseKMLContent(
          kmlContent,
          { id: "default", name: "Default", color: "#3388ff" },
          map
        );
        layer.addTo(map);

        const layerCount = layer.getLayers().length;
        addDebugInfo(`Added single KML with ${layerCount} features`);

        // Auto-fit map to KML bounds
        if (layerCount > 0) {
          try {
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds.pad(0.1));
              addDebugInfo("Fitted map to single KML bounds");
            }
          } catch (boundsError) {
            addDebugInfo(`Could not fit bounds for single KML: ${boundsError}`);
          }
        }
      }
    } catch (error) {
      addDebugInfo(`ERROR loading single KML: ${error}`);
      console.error("Error loading single KML:", error);
    }
  };

  const parseKMLContent = async (
    kmlContent: string,
    kmlConfig: any,
    map: L.Map
  ): Promise<L.LayerGroup> => {
    const layer = L.layerGroup();
    const layerColor = kmlConfig.color || "#3388ff";

    // First try parsing without any cleaning
    addDebugInfo("Attempting direct XML parsing without cleaning...");

    const parser = new DOMParser();
    let kmlDoc: Document | null = null;
    let xmlParseSuccess = false;

    try {
      kmlDoc = parser.parseFromString(kmlContent, "text/xml");

      // Check for parsing errors
      const parserError = kmlDoc.querySelector("parsererror");
      if (!parserError) {
        xmlParseSuccess = true;
        addDebugInfo("Direct XML parsing successful");
      } else {
        addDebugInfo(`XML parser error: ${parserError.textContent}`);
      }
    } catch (error) {
      addDebugInfo(`XML parsing failed: ${error}`);
    }

    // If XML parsing failed or yielded zero features, use regex fallback
    if (xmlParseSuccess && kmlDoc) {
      const features = await parseXMLFeatures(kmlDoc, kmlConfig, layer);
      if (features > 0) {
        addDebugInfo(`XML parsing successful: ${features} features found`);
        return layer;
      } else {
        addDebugInfo(
          "XML parsing yielded zero features, falling back to regex"
        );
      }
    }

    // Fallback to regex-based parsing
    addDebugInfo("Using regex-based KML parsing as fallback");
    return parseKMLWithRegex(kmlContent, kmlConfig);
  };

  const parseXMLFeatures = async (
    kmlDoc: Document,
    kmlConfig: any,
    layer: L.LayerGroup
  ): Promise<number> => {
    const layerColor = kmlConfig.color || "#3388ff";
    let featureCount = 0;

    const placemarks = kmlDoc.getElementsByTagName("Placemark");
    addDebugInfo(`Found ${placemarks.length} placemarks in XML`);

    Array.from(placemarks).forEach((placemark, index) => {
      try {
        const name =
          placemark.getElementsByTagName("name")[0]?.textContent ||
          `${kmlConfig.name} - Feature ${index + 1}`;
        const description =
          placemark.getElementsByTagName("description")[0]?.textContent || "";

        // Handle Point coordinates
        const points = placemark.getElementsByTagName("Point");
        if (points.length > 0) {
          const coordsElement =
            points[0].getElementsByTagName("coordinates")[0];
          if (coordsElement) {
            const coordsText = coordsElement.textContent?.trim();
            if (coordsText) {
              const coords = coordsText.split(",");
              if (coords.length >= 2) {
                const lng = Number.parseFloat(coords[0]);
                const lat = Number.parseFloat(coords[1]);

                if (!isNaN(lat) && !isNaN(lng)) {
                  const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                      className: "custom-kml-marker",
                      html: `<div style="background-color: ${layerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8],
                    }),
                  })
                    .bindPopup(
                      `<strong>${name}</strong><br/>${description}<br/><small>來源: ${kmlConfig.name}</small>`
                    )
                    .addTo(layer);

                  addDebugInfo(
                    `Added point marker: ${name} at [${lat}, ${lng}]`
                  );
                  featureCount++;
                }
              }
            }
          }
        }

        // Handle LineString coordinates (for routes)
        const lineStrings = placemark.getElementsByTagName("LineString");
        if (lineStrings.length > 0) {
          const coordsElement =
            lineStrings[0].getElementsByTagName("coordinates")[0];
          if (coordsElement) {
            const coordsText = coordsElement.textContent?.trim();
            if (coordsText) {
              const latLngs = parseCoordinateString(coordsText);

              if (latLngs.length > 1) {
                const polyline = L.polyline(latLngs, {
                  color: layerColor,
                  weight: 4,
                  opacity: 0.8,
                })
                  .bindPopup(
                    `<strong>${name}</strong><br/>${description}<br/><small>來源: ${kmlConfig.name}</small>`
                  )
                  .addTo(layer);

                addDebugInfo(
                  `Added polyline: ${name} with ${latLngs.length} points`
                );
                featureCount++;
              }
            }
          }
        }

        // Handle MultiGeometry (contains multiple LineStrings)
        const multiGeometries = placemark.getElementsByTagName("MultiGeometry");
        if (multiGeometries.length > 0) {
          const multiGeometry = multiGeometries[0];
          const multiLineStrings =
            multiGeometry.getElementsByTagName("LineString");

          addDebugInfo(
            `Found MultiGeometry with ${multiLineStrings.length} LineStrings`
          );

          Array.from(multiLineStrings).forEach((lineString, lineIndex) => {
            const coordsElement =
              lineString.getElementsByTagName("coordinates")[0];
            if (coordsElement) {
              const coordsText = coordsElement.textContent?.trim();
              if (coordsText) {
                const latLngs = parseCoordinateString(coordsText);

                if (latLngs.length > 1) {
                  const polyline = L.polyline(latLngs, {
                    color: layerColor,
                    weight: 4,
                    opacity: 0.8,
                  })
                    .bindPopup(
                      `<strong>${name} (段 ${
                        lineIndex + 1
                      })</strong><br/>${description}<br/><small>來源: ${
                        kmlConfig.name
                      }</small>`
                    )
                    .addTo(layer);

                  addDebugInfo(
                    `Added multi-polyline segment ${
                      lineIndex + 1
                    }: ${name} with ${latLngs.length} points`
                  );
                  featureCount++;
                }
              }
            }
          });
        }
      } catch (error) {
        addDebugInfo(`Error processing placemark ${index}: ${error}`);
      }
    });

    return featureCount;
  };

  // Enhanced fallback regex-based KML parsing
  const parseKMLWithRegex = (
    kmlContent: string,
    kmlConfig: any
  ): L.LayerGroup => {
    addDebugInfo("Using regex-based KML parsing as fallback");
    const layer = L.layerGroup();
    const layerColor = kmlConfig.color || "#3388ff";

    // Multiple regex patterns to catch different coordinate formats
    const coordinatePatterns = [
      // Standard coordinates tag
      /<coordinates[^>]*>([\s\S]*?)<\/coordinates>/gi,
      // LineString coordinates
      /<LineString[^>]*>[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LineString>/gi,
      // Point coordinates
      /<Point[^>]*>[\s\S]*?<coordinates[^>]*>([\s\S]*?)<\/coordinates>[\s\S]*?<\/Point>/gi,
    ];

    let totalSegments = 0;

    coordinatePatterns.forEach((pattern, patternIndex) => {
      addDebugInfo(`Trying regex pattern ${patternIndex + 1}`);
      let match;
      let segmentIndex = 0;

      // Reset regex lastIndex
      pattern.lastIndex = 0;

      while ((match = pattern.exec(kmlContent)) !== null) {
        const coordsText = match[1]?.trim() || "";

        if (coordsText) {
          addDebugInfo(
            `Found coordinates with pattern ${
              patternIndex + 1
            }: ${coordsText.substring(0, 100)}...`
          );

          const latLngs = parseCoordinateString(coordsText);

          if (latLngs.length > 1) {
            const polyline = L.polyline(latLngs, {
              color: layerColor,
              weight: 4,
              opacity: 0.8,
            })
              .bindPopup(
                `<strong>${kmlConfig.name} - 路線段 ${
                  totalSegments + 1
                }</strong><br/><small>來源: ${
                  kmlConfig.name
                } (Regex解析)</small>`
              )
              .addTo(layer);

            addDebugInfo(
              `Added regex-parsed polyline segment ${totalSegments + 1} with ${
                latLngs.length
              } points`
            );
            totalSegments++;
          } else if (latLngs.length === 1) {
            // Single point
            const marker = L.marker(latLngs[0], {
              icon: L.divIcon({
                className: "custom-kml-marker",
                html: `<div style="background-color: ${layerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              }),
            })
              .bindPopup(
                `<strong>${kmlConfig.name} - 點 ${
                  totalSegments + 1
                }</strong><br/><small>來源: ${
                  kmlConfig.name
                } (Regex解析)</small>`
              )
              .addTo(layer);

            addDebugInfo(`Added regex-parsed point ${totalSegments + 1}`);
            totalSegments++;
          }
        }
        segmentIndex++;
      }

      addDebugInfo(`Pattern ${patternIndex + 1} found ${segmentIndex} matches`);
    });

    // If still no segments found, try aggressive coordinate extraction
    if (totalSegments === 0) {
      addDebugInfo(
        "No segments found with standard patterns, trying aggressive coordinate extraction"
      );

      // Look for any sequence of numbers that could be coordinates (Taiwan bounds)
      const aggressivePattern =
        /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:,\s*(-?\d+\.?\d*))?\s+/g;
      const allCoords: L.LatLng[] = [];
      let match;

      while ((match = aggressivePattern.exec(kmlContent)) !== null) {
        const lng = Number.parseFloat(match[1]);
        const lat = Number.parseFloat(match[2]);

        // Basic validation for Taiwan area coordinates
        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= 20 &&
          lat <= 26 &&
          lng >= 118 &&
          lng <= 124
        ) {
          allCoords.push(L.latLng(lat, lng));
        }
      }

      if (allCoords.length > 1) {
        const polyline = L.polyline(allCoords, {
          color: layerColor,
          weight: 4,
          opacity: 0.8,
        })
          .bindPopup(
            `<strong>${kmlConfig.name} - 完整路線</strong><br/><small>來源: ${kmlConfig.name} (積極解析)</small>`
          )
          .addTo(layer);

        addDebugInfo(
          `Added aggressively parsed polyline with ${allCoords.length} points`
        );
        totalSegments = 1;
      }
    }

    addDebugInfo(`Regex parsing completed: ${totalSegments} segments found`);
    return layer;
  };

  // Helper function to parse coordinate strings
  const parseCoordinateString = (coordsText: string): L.LatLng[] => {
    const latLngs: L.LatLng[] = [];

    if (!coordsText || coordsText.trim().length === 0) {
      return latLngs;
    }

    // Clean up the coordinate text
    const cleanedText = coordsText
      .replace(/[\r\n\t]/g, " ") // Replace line breaks and tabs with spaces
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    // Split coordinates by whitespace
    const coordPairs = cleanedText
      .split(/\s+/)
      .map((pair) => pair.trim())
      .filter((pair) => pair.length > 0 && pair.includes(","));

    coordPairs.forEach((coordPair, pairIndex) => {
      const coords = coordPair.split(",").map((c) => c.trim());

      if (coords.length >= 2) {
        const lng = Number.parseFloat(coords[0]);
        const lat = Number.parseFloat(coords[1]);

        // Validate coordinates
        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          latLngs.push(L.latLng(lat, lng));
        }
      }
    });

    return latLngs;
  };

  const handleLayerToggle = (layerId: string, layerName: string) => {
    const isCurrentlySelected = selectedLayerId === layerId;

    if (isCurrentlySelected) {
      // If clicking on the currently selected layer, clear the selection
      clearSelection();
      return;
    }

    // Select the new layer
    selectLayer(layerId, layerName);
  };

  const showAllLayers = () => {
    // This function is kept for potential future use but doesn't affect selection
    addDebugInfo("Show all layers clicked - no action in single select mode");
  };

  const hideAllLayers = () => {
    // Clear selection when hiding all layers
    clearSelection();
    addDebugInfo("Hide all layers - cleared selection");
  };


  const filteredKmlFiles = getFilteredKmlFiles();

  return (
    <div className="space-y-4">
      {/* Selection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">單選</Badge>
          <span className="text-sm text-gray-600">
            請在下方圖層控制中選擇一個路線
          </span>

        </div>
        {value && (
          <div className="flex items-center gap-2">
            <Badge variant="default">已選擇: {value}</Badge>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              清除選擇
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-64 rounded-lg border" />
      </div>

      {/* Layer Control Panel */}
      {filteredKmlFiles &&
        filteredKmlFiles.length > 0 &&
        question.showLayerControl !== false && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">點擊選擇您騎行的路線</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={hideAllLayers}>
                    清除選擇
                  </Button>
                </div>
              </div>

            </CardHeader>
            <CardContent className="space-y-2">
              {filteredKmlFiles.map((kmlFile: any) => {
                const status = kmlLoadingStatus.get(kmlFile.id);
                const isSelected = selectedLayerId === kmlFile.id;

                return (
                  <div
                    key={kmlFile.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`layer-${kmlFile.id}`}
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleLayerToggle(kmlFile.id, kmlFile.name)
                        }
                        disabled={status === "loading" || status === "error"}
                      />
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`layer-${kmlFile.id}`}
                          className={`text-sm cursor-pointer ${
                            isSelected ? "font-medium text-blue-600" : ""
                          }`}
                        >
                          {kmlFile.name}
                        </Label>
                        {isWarning && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200"
                          >
                            ⚠️ 重複
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {status === "loading" && "載入中..."}
                      {status === "loaded" && "✓"}
                      {status === "error" && "❌"}
                      {isSelected && (
                        <span className="text-blue-600 font-medium ml-2">
                          已選擇
                        </span>
                      )}
                      {isWarning && warningRoute && (
                        <span className="text-yellow-600 font-medium ml-2 text-xs">
                          已提交過
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
