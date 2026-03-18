use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub version: String,
    pub hostname: String,
    pub cpu: String,
    pub memory: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPaths {
    pub home: String,
    pub desktop: String,
    pub documents: String,
    pub downloads: String,
    pub pictures: String,
}

pub mod knowledge;