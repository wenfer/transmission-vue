import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { torrentApiBase } from '@/config/torrentClient'

class QBittorrentClient {
  private client: AxiosInstance

  constructor(baseURL: string = torrentApiBase) {
    this.client = axios.create({
      baseURL,
      withCredentials: true,
    })
  }

  setBaseUrl(url: string) {
    if (url) {
      this.client.defaults.baseURL = url
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  buildFormData(params: Record<string, string | number | boolean>) {
    const body = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      body.append(key, String(value))
    })
    return body
  }
}

export const qbittorrentClient = new QBittorrentClient()
