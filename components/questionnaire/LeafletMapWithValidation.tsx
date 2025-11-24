"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { RouteAvailability } from "@/types/route-submission";

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

interface LeafletMapWithValidationProps {
  question: any;
  value: any;
  onChange: (routeId: string, routeName: string) => Promise<boolean>;
  routeAvailability: RouteAvailability;
}

export default function LeafletMapWithValidation({
  question,
  value,
  onChange,
  routeAvailability,
}: LeafletMapWithValidationProps) {
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
    console.log(`[LeafletMapWithValidation] ${message}`);
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

    // Load multiple KML files if provided
    if (question.kmlFiles && question.kmlFiles.length > 0) {
      addDebugInfo(`Loading ${question.kmlFiles.length} KML files...`);
      loadMultipleKML(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        addDebugInfo("Cleaning up map...");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update visual feedback when value changes
  useEffect(() => {
    updateSelectedLayerDisplay();
  }, [value]);

  const selectLayer = async (layerId: string, layerName: string) => {
    // Check if this route can be selected
    const canSelect = await onChange(layerId, layerName);

    if (!canSelect) {
      addDebugInfo(`Route selection blocked for: ${layerName}`);
      return;
    }

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

    // Add layer to map and apply selection styling
    layer.addTo(map);
    applySelectedStyle(layer, layerId);

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

  const applySelectedStyle = (layer: L.LayerGroup, layerId: string) => {
    // Check if this route is restricted or has warnings
    const isRestricted = routeAvailability.restricted.some(
      (r) => r.id === layerId
    );
    const hasWarning = routeAvailability.warnings.some((r) => r.id === layerId);

    let color = "#ff0000"; // Default selected color
    if (isRestricted) {
      color = "#cccccc"; // Gray for restricted
    } else if (hasWarning) {
      color = "#ff9900"; // Orange for warning
    }

    layer.eachLayer((feature) => {
      if (feature instanceof L.Polyline) {
        feature.setStyle({
          color: color,
          weight: 6,
          opacity: 1,
        });
      }
    });
  };

  const resetLayerStyle = (layer: L.LayerGroup) => {
    layer.eachLayer((feature) => {
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
      return;
    }

    // Find layer by name (value is the layer name)
    const matchingKmlFile = question.kmlFiles?.find(
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
          applySelectedStyle(layer, matchingKmlFile.id);

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

  const clearSelection = async () => {
    const map = mapInstanceRef.current;
    if (selectedLayerRef.current && map) {
      resetLayerStyle(selectedLayerRef.current);
      map.removeLayer(selectedLayerRef.current);
    }
    selectedLayerRef.current = null;
    setSelectedLayerId("");
    await onChange("", "");
    addDebugInfo("Selection cleared");
  };

  const loadMultipleKML = async (map: L.Map) => {
    const allBounds: L.LatLngBounds[] = [];
    addDebugInfo(`Starting to load ${question.kmlFiles.length} KML files`);

    for (const kmlFile of question.kmlFiles) {
      const encodedUrl = encodeURI(kmlFile.url);
      addDebugInfo(`Loading KML: ${kmlFile.name} from ${encodedUrl}`);
      setKmlLoadingStatus((prev) => new Map(prev).set(kmlFile.id, "loading"));

      try {
        const response = await fetch(encodedUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const kmlContent = await response.text();
        const layer = await parseKMLContent(kmlContent, kmlFile, map);
        const layerCount = layer.getLayers().length;

        if (layerCount > 0) {
          kmlLayersRef.current.set(kmlFile.id, layer);

          // Apply appropriate styling based on route availability
          const isRestricted = routeAvailability.restricted.some(
            (r) => r.id === kmlFile.id
          );
          const hasWarning = routeAvailability.warnings.some(
            (r) => r.id === kmlFile.id
          );

          layer.eachLayer((feature) => {
            if (feature instanceof L.Polyline) {
              let color = kmlFile.color || "#3388ff";
              let opacity = 0.8;

              if (isRestricted) {
                color = "#cccccc";
                opacity = 0.5;
              } else if (hasWarning) {
                color = "#ff9900";
              }

              feature.setStyle({
                color: color,
                weight: 4,
                opacity: opacity,
              });

              // Add click handler only if not disabled
              if (!kmlFile.disabled) {
                feature.on("click", () =>
                  selectLayer(kmlFile.id, kmlFile.name)
                );
              }
            }
          });

          // Collect bounds for auto-fitting
          try {
            const layerBounds = layer.getBounds();
            if (layerBounds.isValid()) {
              allBounds.push(layerBounds);
            }
          } catch (boundsError) {
            addDebugInfo(
              `Could not get bounds for ${kmlFile.name}: ${boundsError}`
            );
          }

          // Show layer if visible by default and not restricted
          if (kmlFile.visible && !isRestricted) {
            layer.addTo(map);
          }

          setKmlLoadingStatus((prev) =>
            new Map(prev).set(kmlFile.id, "loaded")
          );
          addDebugInfo(
            `Successfully loaded ${kmlFile.name} with ${layerCount} features`
          );
        } else {
          throw new Error("No features found in KML");
        }
      } catch (error) {
        addDebugInfo(`Failed to load ${kmlFile.name}: ${error}`);
        setKmlLoadingStatus((prev) => new Map(prev).set(kmlFile.id, "error"));
      }
    }

    // Auto-fit map to show all loaded layers
    if (allBounds.length > 0) {
      const group = new L.FeatureGroup();
      allBounds.forEach((bound) => {
        L.rectangle(bound).addTo(group);
      });
      map.fitBounds(group.getBounds().pad(0.1));
      addDebugInfo("Auto-fitted map to all layer bounds");
    }
  };

  // Simplified KML parsing (reusing logic from original LeafletMap)
  const parseKMLContent = async (
    kmlContent: string,
    kmlConfig: any,
    map: L.Map
  ): Promise<L.LayerGroup> => {
    const layer = new L.LayerGroup();

    // Basic regex-based parsing for LineString coordinates
    const lineStringRegex =
      /<LineString>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LineString>/g;
    let match;

    while ((match = lineStringRegex.exec(kmlContent)) !== null) {
      const coordsText = match[1].trim();
      const latLngs = parseCoordinateString(coordsText);

      if (latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: kmlConfig.color || "#3388ff",
          weight: 4,
          opacity: 0.8,
        }).bindPopup(`<strong>${kmlConfig.name}</strong>`);

        polyline.addTo(layer);
      }
    }

    return layer;
  };

  const parseCoordinateString = (coordsText: string): L.LatLng[] => {
    const latLngs: L.LatLng[] = [];
    const coordinates = coordsText.trim().split(/\s+/);

    coordinates.forEach((coord) => {
      const parts = coord.split(",");
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          latLngs.push(new L.LatLng(lat, lng));
        }
      }
    });

    return latLngs;
  };

  const showLayer = (layerId: string) => {
    const layer = kmlLayersRef.current.get(layerId);
    const map = mapInstanceRef.current;
    if (layer && map && !map.hasLayer(layer)) {
      layer.addTo(map);
      addDebugInfo(`Showed layer: ${layerId}`);
    }
  };

  const hideLayer = (layerId: string) => {
    const layer = kmlLayersRef.current.get(layerId);
    const map = mapInstanceRef.current;
    if (layer && map && map.hasLayer(layer) && selectedLayerId !== layerId) {
      map.removeLayer(layer);
      addDebugInfo(`Hid layer: ${layerId}`);
    }
  };

  const hideAllLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    kmlLayersRef.current.forEach((layer, layerId) => {
      if (map.hasLayer(layer) && selectedLayerId !== layerId) {
        map.removeLayer(layer);
      }
    });
    addDebugInfo("Hid all non-selected layers");
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-64 z-0" />

      {/* Control Panel */}
      <div className="absolute top-2 right-2 z-[1000] max-w-xs">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">路線選擇</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current Selection */}
            {selectedLayerId && (
              <div className="p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-600 font-medium">已選擇路線</p>
                <p className="text-sm">{value}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="mt-1"
                >
                  清除選擇
                </Button>
              </div>
            )}

            {/* Layer Controls */}
            {question.showLayerControl !== false && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium">顯示/隱藏路線</p>
                  <Button variant="outline" size="sm" onClick={hideAllLayers}>
                    隱藏全部
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {question.kmlFiles?.map((kmlFile: any) => {
                    const status = kmlLoadingStatus.get(kmlFile.id);
                    const isSelected = selectedLayerId === kmlFile.id;
                    const isRestricted = routeAvailability.restricted.some(
                      (r) => r.id === kmlFile.id
                    );
                    const hasWarning = routeAvailability.warnings.some(
                      (r) => r.id === kmlFile.id
                    );

                    return (
                      <div
                        key={kmlFile.id}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <Checkbox
                          id={`layer-${kmlFile.id}`}
                          checked={
                            mapInstanceRef.current?.hasLayer(
                              kmlLayersRef.current.get(kmlFile.id)!
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              showLayer(kmlFile.id);
                            } else {
                              hideLayer(kmlFile.id);
                            }
                          }}
                          disabled={
                            status === "loading" ||
                            status === "error" ||
                            isRestricted
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`layer-${kmlFile.id}`}
                            className={`cursor-pointer truncate block text-xs ${
                              isRestricted
                                ? "text-gray-400"
                                : hasWarning
                                ? "text-amber-600"
                                : "text-gray-700"
                            }`}
                            onClick={() =>
                              !isRestricted &&
                              selectLayer(kmlFile.id, kmlFile.name)
                            }
                          >
                            {kmlFile.name}
                          </Label>
                          <div className="flex items-center mt-1 space-x-1">
                            {status === "loading" && (
                              <Badge variant="secondary" className="text-xs">
                                載入中
                              </Badge>
                            )}
                            {status === "error" && (
                              <Badge variant="destructive" className="text-xs">
                                錯誤
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                已選擇
                              </Badge>
                            )}
                            {isRestricted && (
                              <Badge variant="secondary" className="text-xs">
                                已填寫
                              </Badge>
                            )}
                            {hasWarning && !isRestricted && (
                              <Badge
                                variant="outline"
                                className="text-xs text-amber-600"
                              >
                                ⚠️
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
