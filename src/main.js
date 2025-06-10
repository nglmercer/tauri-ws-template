/**
 * WebSocket Manager Module
 * Maneja la conexión WebSocket y los mensajes
 */
class WebSocketManager {
  constructor(url = "ws://localhost:8080/ws") {
      this.url = url;
      this.socket = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 1000;
      this.listeners = new Map();
      this.isConnected = false;
  }

  /**
   * Conectar al WebSocket
   */
  connect() {
      try {
          this.socket = new WebSocket(this.url);
          this.setupEventListeners();
      } catch (error) {
          console.error("Error connecting to WebSocket:", error);
          this.handleReconnect();
      }
  }

  /**
   * Configurar event listeners del WebSocket
   */
  setupEventListeners() {
      this.socket.onopen = () => {
          console.log("WebSocket connected successfully");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
      };

      this.socket.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              console.log("Message received:", data);
              this.emit('message', data);
              
              // Emit specific action events
              if (data.action) {
                  this.emit(data.action, data);
              }
          } catch (error) {
              console.log("Raw message received:", event.data);
              this.emit('raw_message', event.data);
          }
      };

      this.socket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          this.isConnected = false;
          this.emit('disconnected', event);
          
          if (!event.wasClean) {
              this.handleReconnect();
          }
      };

      this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit('error', error);
      };
  }

  /**
   * Manejar reconexión automática
   */
  handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          
          setTimeout(() => {
              this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
      } else {
          console.error("Max reconnection attempts reached");
          this.emit('max_reconnect_reached');
      }
  }

  /**
   * Enviar mensaje
   */
  send(data) {
      if (!this.isConnected || this.socket.readyState !== WebSocket.OPEN) {
          console.warn("WebSocket not connected, queuing message");
          // Podrías implementar una cola de mensajes aquí
          return false;
      }

      try {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          this.socket.send(message);
          console.log("Message sent:", data);
          return true;
      } catch (error) {
          console.error("Error sending message:", error);
          return false;
      }
  }

  /**
   * Agregar event listener
   */
  on(event, callback) {
      if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
  }

  /**
   * Remover event listener
   */
  off(event, callback) {
      if (this.listeners.has(event)) {
          const callbacks = this.listeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
              callbacks.splice(index, 1);
          }
      }
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
      if (this.listeners.has(event)) {
          this.listeners.get(event).forEach(callback => {
              try {
                  callback(data);
              } catch (error) {
                  console.error(`Error in event listener for ${event}:`, error);
              }
          });
      }
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
      if (this.socket) {
          this.socket.close(1000, "Manual disconnect");
      }
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionState() {
      if (!this.socket) return 'DISCONNECTED';
      
      switch (this.socket.readyState) {
          case WebSocket.CONNECTING: return 'CONNECTING';
          case WebSocket.OPEN: return 'CONNECTED';
          case WebSocket.CLOSING: return 'CLOSING';
          case WebSocket.CLOSED: return 'CLOSED';
          default: return 'UNKNOWN';
      }
  }
}
/**
 * Window Manager Module
 * Maneja operaciones de ventanas a través de WebSocket
 */
class WindowManager {
  constructor(webSocketManager) {
      this.ws = webSocketManager;
      this.windows = new Map();
      this.setupEventListeners();
  }

  /**
   * Configurar event listeners para respuestas del servidor
   */
  setupEventListeners() {
      this.ws.on('window_created', (data) => {
          console.log('Window created:', data);
          if (data.label) {
              this.windows.set(data.label, {
                  label: data.label,
                  url: data.url,
                  status: 'created',
                  createdAt: new Date()
              });
          }
      });

      this.ws.on('window_closed', (data) => {
          console.log('Window closed:', data);
          if (data.label) {
              this.windows.delete(data.label);
          }
      });

      this.ws.on('window_list', (data) => {
          console.log('Window list received:', data);
      });

      this.ws.on('window_info', (data) => {
          console.log('Window info received:', data);
      });
  }

  /**
   * Crear o abrir ventana
   */
  createWindow(url, label = null) {
      const windowLabel = label || `window_${Date.now()}`;
      
      const message = {
          action: "create_window",
          label: windowLabel,
          url: url,
          transparent: true
      };

      const success = this.ws.send(message);
      
      if (success) {
          // Agregar a la lista local de ventanas pendientes
          this.windows.set(windowLabel, {
              label: windowLabel,
              url: url,
              status: 'creating',
              createdAt: new Date()
          });
      }

      return { success, label: windowLabel };
  }

  /**
   * Cerrar ventana
   */
  closeWindow(label) {
      const message = {
          action: "close_window",
          label: label
      };

      const success = this.ws.send(message);
      
      if (success && this.windows.has(label)) {
          const window = this.windows.get(label);
          window.status = 'closing';
      }

      return success;
  }

  /**
   * Enfocar ventana
   */
  focusWindow(label) {
      const message = {
          action: "focus_window",
          label: label
      };

      return this.ws.send(message);
  }

  /**
   * Ocultar ventana
   */
  hideWindow(label) {
      const message = {
          action: "hide_window",
          label: label
      };

      return this.ws.send(message);
  }

  /**
   * Navegar ventana a nueva URL
   */
  navigateWindow(label, url) {
      const message = {
          action: "navigate_window",
          label: label,
          url: url
      };

      const success = this.ws.send(message);
      
      if (success && this.windows.has(label)) {
          const window = this.windows.get(label);
          window.url = url;
      }

      return success;
  }

  /**
   * Actualizar título de ventana
   */
  updateWindowTitle(label, title) {
      const message = {
          action: "update_window_title",
          label: label,
          title: title
      };

      return this.ws.send(message);
  }

  /**
   * Listar todas las ventanas
   */
  listWindows() {
      const message = {
          action: "list_windows"
      };

      return this.ws.send(message);
  }

  /**
   * Obtener información de una ventana específica
   */
  getWindowInfo(label) {
      const message = {
          action: "get_window_info",
          label: label
      };

      return this.ws.send(message);
  }

  /**
   * Obtener URL de una ventana
   */
  getWindowUrl(label) {
      const message = {
          action: "get_window_url",
          label: label
      };

      return this.ws.send(message);
  }

  /**
   * Obtener ventanas activas
   */
  getActiveWindows() {
      const message = {
          action: "get_active_windows"
      };

      return this.ws.send(message);
  }

  /**
   * Limpiar ventanas cerradas
   */
  cleanupClosedWindows() {
      const message = {
          action: "cleanup_closed_windows"
      };

      return this.ws.send(message);
  }

  /**
   * Verificar si una ventana existe
   */
  windowExists(label) {
      const message = {
          action: "window_exists",
          label: label
      };

      return this.ws.send(message);
  }

  /**
   * Obtener lista local de ventanas
   */
  getLocalWindows() {
      return Array.from(this.windows.values());
  }

  /**
   * Crear múltiples ventanas
   */
  createMultipleWindows(urls, labelPrefix = 'batch') {
      const results = [];
      
      urls.forEach((url, index) => {
          const label = `${labelPrefix}_${index + 1}`;
          const result = this.createWindow(url, label);
          results.push(result);
      });

      return results;
  }

  /**
   * Cerrar múltiples ventanas
   */
  closeMultipleWindows(labels) {
      const results = [];
      
      labels.forEach(label => {
          const success = this.closeWindow(label);
          results.push({ label, success });
      });

      return results;
  }

  /**
   * Crear ventana con retraso
   */
  createWindowDelayed(url, label, delay = 1000) {
      return new Promise((resolve) => {
          setTimeout(() => {
              const result = this.createWindow(url, label);
              resolve(result);
          }, delay);
      });
  }

  /**
   * Cerrar ventana con retraso
   */
  closeWindowDelayed(label, delay = 1000) {
      return new Promise((resolve) => {
          setTimeout(() => {
              const success = this.closeWindow(label);
              resolve(success);
          }, delay);
      });
  }
}
/**
 * UI Manager Module
 * Maneja la interfaz de usuario y las interacciones
 */
class UIManager {
  constructor(webSocketManager, windowManager) {
      this.ws = webSocketManager;
      this.windowManager = windowManager;
      this.elements = {};
      this.setupEventListeners();
  }

  /**
   * Inicializar elementos DOM
   */
  init() {
      this.elements = {
          greetMsg: document.querySelector("#greet-msg"),
          greetInput: document.querySelector("#greet-input"),
          greetForm: document.querySelector("#greet-form"),
          connectionStatus: document.querySelector("#connection-status"),
          windowList: document.querySelector("#window-list"),
          createWindowBtn: document.querySelector("#create-window-btn"),
          urlInput: document.querySelector("#url-input"),
          labelInput: document.querySelector("#label-input")
      };

      this.setupDOMEventListeners();
      this.updateConnectionStatus();
  }

  /**
   * Configurar event listeners del WebSocket
   */
  setupEventListeners() {
      this.ws.on('connected', () => {
          this.updateConnectionStatus('Connected', 'success');
          this.showMessage('Connected to server successfully!');
      });

      this.ws.on('disconnected', () => {
          this.updateConnectionStatus('Disconnected', 'error');
          this.showMessage('Disconnected from server', 'error');
      });

      this.ws.on('error', (error) => {
          this.updateConnectionStatus('Error', 'error');
          this.showMessage('Connection error occurred', 'error');
      });

      this.ws.on('message', (data) => {
          this.handleServerMessage(data);
      });

      this.ws.on('raw_message', (message) => {
          this.showMessage(`Raw message: ${message}`);
      });
  }

  /**
   * Configurar event listeners del DOM
   */
  setupDOMEventListeners() {
      // Formulario de saludo
      if (this.elements.greetForm) {
          this.elements.greetForm.addEventListener("submit", (e) => {
              e.preventDefault();
              this.handleGreeting();
          });
      }

      // Botón crear ventana
      if (this.elements.createWindowBtn) {
          this.elements.createWindowBtn.addEventListener("click", () => {
              this.handleCreateWindow();
          });
      }

      // Teclas de acceso rápido
      document.addEventListener('keydown', (e) => {
          this.handleKeyboardShortcuts(e);
      });
  }

  /**
   * Manejar saludo
   */
  handleGreeting() {
      const name = this.elements.greetInput?.value || 'Anonymous';
      
      const message = {
          action: 'say_hello',
          data: `Hello from ${name}!`
      };

      this.ws.send(message);
      this.showMessage(`Greeting sent: ${message.data}`);
  }

  /**
   * Manejar creación de ventana desde UI
   */
  handleCreateWindow() {
      const url = this.elements.urlInput?.value || 'https://example.com';
      const label = this.elements.labelInput?.value || null;

      const result = this.windowManager.createWindow(url, label);
      
      if (result.success) {
          this.showMessage(`Creating window: ${result.label}`);
          this.updateWindowList();
      } else {
          this.showMessage('Failed to create window', 'error');
      }
  }

  /**
   * Manejar mensajes del servidor
   */
  handleServerMessage(data) {
      switch (data.action) {
          case 'window_created':
              this.showMessage(`Window created: ${data.label}`, 'success');
              this.updateWindowList();
              break;
          
          case 'window_closed':
              this.showMessage(`Window closed: ${data.label}`, 'info');
              this.updateWindowList();
              break;
          
          case 'window_list':
              this.displayWindowList(data.windows);
              break;
          
          case 'error':
              this.showMessage(`Error: ${data.message}`, 'error');
              break;
          
          default:
              this.showMessage(`Server message: ${JSON.stringify(data)}`);
      }
  }

  /**
   * Manejar atajos de teclado
   */
  handleKeyboardShortcuts(e) {
      // Ctrl + N: Nueva ventana
      if (e.ctrlKey && e.key === 'n') {
          e.preventDefault();
          this.createQuickWindow();
      }
      
      // Ctrl + L: Listar ventanas
      if (e.ctrlKey && e.key === 'l') {
          e.preventDefault();
          this.windowManager.listWindows();
      }
      
      // Ctrl + R: Reconectar
      if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          this.reconnect();
      }
  }

  /**
   * Mostrar mensaje en la UI
   */
  showMessage(message, type = 'info') {
      if (this.elements.greetMsg) {
          this.elements.greetMsg.textContent = message;
          this.elements.greetMsg.className = `message ${type}`;
      }
      
      console.log(`[${type.toUpperCase()}] ${message}`);
      
      // Crear notificación toast si existe el contenedor
      this.createToast(message, type);
  }

  /**
   * Crear notificación toast
   */
  createToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      // Agregar al contenedor de toasts o al body
      const container = document.querySelector('#toast-container') || document.body;
      container.appendChild(toast);
      
      // Auto-remover después de 3 segundos
      setTimeout(() => {
          toast.remove();
      }, 3000);
  }

  /**
   * Actualizar estado de conexión
   */
  updateConnectionStatus(status = null, type = 'info') {
      const currentStatus = status || this.ws.getConnectionState();
      
      if (this.elements.connectionStatus) {
          this.elements.connectionStatus.textContent = `Status: ${currentStatus}`;
          this.elements.connectionStatus.className = `status ${type}`;
      }
  }

  /**
   * Actualizar lista de ventanas
   */
  updateWindowList() {
      this.windowManager.listWindows();
  }

  /**
   * Mostrar lista de ventanas
   */
  displayWindowList(windows) {
      if (!this.elements.windowList) return;

      this.elements.windowList.innerHTML = '';
      
      if (!windows || windows.length === 0) {
          this.elements.windowList.innerHTML = '<li>No windows open</li>';
          return;
      }

      windows.forEach(window => {
          const li = document.createElement('li');
          li.className = 'window-item';
          li.innerHTML = `
              <span class="window-label">${window.label}</span>
              <span class="window-url">${window.url}</span>
              <button onclick="uiManager.closeWindowFromList('${window.label}')">Close</button>
              <button onclick="uiManager.focusWindowFromList('${window.label}')">Focus</button>
          `;
          this.elements.windowList.appendChild(li);
      });
  }

  /**
   * Cerrar ventana desde la lista
   */
  closeWindowFromList(label) {
      this.windowManager.closeWindow(label);
  }

  /**
   * Enfocar ventana desde la lista
   */
  focusWindowFromList(label) {
      this.windowManager.focusWindow(label);
  }

  /**
   * Crear ventana rápida
   */
  createQuickWindow() {
      const urls = [
          'https://example.com',
          'https://google.com',
          'https://github.com',
          'https://stackoverflow.com'
      ];
      
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      this.windowManager.createWindow(randomUrl);
  }

  /**
   * Reconectar WebSocket
   */
  reconnect() {
      this.showMessage('Attempting to reconnect...', 'info');
      this.ws.disconnect();
      setTimeout(() => {
          this.ws.connect();
      }, 1000);
  }

  /**
   * Demo de múltiples ventanas
   */
  runWindowDemo() {
      const urls = [
          'https://example.com',
          'https://google.com',
          'https://bing.com',
          'https://duckduckgo.com',
          'https://wikipedia.org'
      ];

      this.showMessage('Starting window demo...', 'info');

      // Crear ventanas con retraso
      urls.forEach((url, index) => {
          setTimeout(() => {
              this.windowManager.createWindow(url, `demo_${index + 1}`);
          }, index * 500);
      });

      // Cerrar ventanas después de 5 segundos
      setTimeout(() => {
          this.showMessage('Closing demo windows...', 'info');
          urls.forEach((url, index) => {
              setTimeout(() => {
                  this.windowManager.closeWindow(`demo_${index + 1}`);
              }, index * 200);
          });
      }, 5000);
  }

  /**
   * Limpiar UI
   */
  clear() {
      if (this.elements.greetMsg) {
          this.elements.greetMsg.textContent = '';
      }
      
      if (this.elements.windowList) {
          this.elements.windowList.innerHTML = '';
      }
  }
}
/**
 * Main Application
 * Punto de entrada principal que inicializa todos los módulos
 */
/* import WebSocketManager from './websocket-manager.js';
import WindowManager from './window-manager.js';
import UIManager from './ui-manager.js'; */

class App {
    constructor() {
        this.wsManager = null;
        this.windowManager = null;
        this.uiManager = null;
        this.isInitialized = false;
    }

    /**
     * Inicializar aplicación
     */
    async init() {
        try {
            console.log('Initializing application...');

            // Inicializar WebSocket Manager
            this.wsManager = new WebSocketManager('ws://localhost:8080/ws');
            
            // Inicializar Window Manager
            this.windowManager = new WindowManager(this.wsManager);
            
            // Inicializar UI Manager
            this.uiManager = new UIManager(this.wsManager, this.windowManager);

            // Conectar WebSocket
            this.wsManager.connect();

            // Configurar eventos globales
            this.setupGlobalEvents();

            this.isInitialized = true;
            console.log('Application initialized successfully');

            // Ejecutar demo si está habilitado
            this.runInitialDemo();

        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Exponer managers globalmente para debugging
        window.app = this;
        window.wsManager = this.wsManager;
        window.windowManager = this.windowManager;
        window.uiManager = this.uiManager;

        // Manejar cierre de la aplicación
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Application hidden');
            } else {
                console.log('Application visible');
                // Reconectar si es necesario
                if (this.wsManager.getConnectionState() === 'CLOSED') {
                    this.wsManager.connect();
                }
            }
        });
    }

    /**
     * Ejecutar demo inicial
     */
    runInitialDemo() {
        // Esperar a que se establezca la conexión
        this.wsManager.on('connected', () => {
            setTimeout(() => {
                this.runBasicDemo();
            }, 1000);
        });
    }

    /**
     * Demo básico de funcionalidad
     */
    runBasicDemo() {
        console.log('Running basic demo...');

        // Enviar saludo inicial
        this.wsManager.send({
            action: 'say_hello',
            data: 'Hello from modular application!'
        });

        // Demo de ventanas después de 2 segundos
        setTimeout(() => {
            this.runWindowDemo();
        }, 2000);
    }

    /**
     * Demo de ventanas
     */
    runWindowDemo() {
        console.log('Running window demo...');

        const demoWindows = [
            { url: 'https://example.com', label: 'demo_example' },
            { url: 'https://google.com', label: 'demo_google' },
            { url: 'https://github.com', label: 'demo_github' }
        ];

        // Crear ventanas
        demoWindows.forEach((window, index) => {
            setTimeout(() => {
                this.windowManager.createWindow(window.url, window.label);
            }, index * 1000);
        });

        // Listar ventanas después de crear todas
        setTimeout(() => {
            this.windowManager.listWindows();
        }, demoWindows.length * 1000 + 500);

        // Cerrar ventanas después de 8 segundos
        setTimeout(() => {
            console.log('Closing demo windows...');
            demoWindows.forEach((window, index) => {
                setTimeout(() => {
                    this.windowManager.closeWindow(window.label);
                }, index * 500);
            });
        }, 8000);
    }

    /**
     * Métodos de utilidad pública
     */

    /**
     * Crear ventana personalizada
     */
    createWindow(url, label = null) {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return false;
        }
        return this.windowManager.createWindow(url, label);
    }

    /**
     * Cerrar ventana
     */
    closeWindow(label) {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return false;
        }
        return this.windowManager.closeWindow(label);
    }

    /**
     * Enviar mensaje personalizado
     */
    sendMessage(action, data = null) {
        if (!this.isInitialized) {
            console.warn('Application not initialized');
            return false;
        }
        return this.wsManager.send({ action, data });
    }

    /**
     * Obtener estado de la aplicación
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            wsConnection: this.wsManager?.getConnectionState(),
            localWindows: this.windowManager?.getLocalWindows() || []
        };
    }

    /**
     * Reconectar WebSocket
     */
    reconnect() {
        if (this.wsManager) {
            this.wsManager.disconnect();
            setTimeout(() => {
                this.wsManager.connect();
            }, 1000);
        }
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        console.log('Cleaning up application...');
        
        if (this.wsManager) {
            this.wsManager.disconnect();
        }
        
        if (this.uiManager) {
            this.uiManager.clear();
        }
    }

    /**
     * Reiniciar aplicación
     */
    restart() {
        this.cleanup();
        setTimeout(() => {
            this.init();
        }, 1000);
    }
}

// Función para comandos de consola
window.appCommands = {
    create: (url, label) => window.app?.createWindow(url, label),
    close: (label) => window.app?.closeWindow(label),
    list: () => window.app?.windowManager?.listWindows(),
    status: () => window.app?.getStatus(),
    reconnect: () => window.app?.reconnect(),
    demo: () => window.app?.runWindowDemo(),
    cleanup: () => window.app?.cleanup()
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    
    const app = new App();
    await app.init();
    
    // Inicializar UI después de que todo esté listo
    setTimeout(() => {
        app.uiManager.init();
    }, 500);
});

// Exportar para uso como módulo
//export default App;
//export default UIManager;
//export default WindowManager;
//export default WebSocketManager;